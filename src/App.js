import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SocialShare from './components/layout/SocialShare';
import AddTask from './components/tasks/AddTask';
import PrioritySection from './components/tasks/PrioritySection';
import TaskItem from './components/tasks/TaskItem';
import SearchBar from './components/tasks/SearchBar';
import DeleteCategoryModal from './components/modals/DeleteCategoryModal';
import ProjectTabs from './components/projects/ProjectTabs';
import EditModal from './components/modals/EditModal';
import WelcomeModal from './components/modals/WelcomeModal';
import CongratsModal from './components/modals/CongratsModal';
import TodoistImportModal from './components/modals/TodoistImportModal';
import ImportSelectionModal from './components/modals/ImportSelectionModal';
import RestoreShadowModal from './components/modals/RestoreShadowModal';
import { InstallPrompt, BackupReminder, UpdateReadyPrompt } from './components/layout/NotificationBar';
import { useTasks } from './hooks/useTasks';
import { useAppSystem } from './hooks/useAppSystem';
import { PROJECT_COLORS } from './utils/constants';

const TodoApp = () => {
  const {
    tasks, archived, projects, addTask, completeTask, deleteArchivedTask,
    restoreTask, updateTask, reorderTasks, addProject, updateProject, deleteProject, importData, bulkAddTasks
  } = useTasks();

  const {
    showWelcome, showInstallPrompt, showBackupReminder, showCongrats,
    showUpdateReady, swRegistration,
    setShowCongrats, setShowUpdateReady, checkMilestones, dismissWelcome, dismissInstallPrompt,
    dismissBackupReminder, recordBackup
  } = useAppSystem(archived.length, tasks.length);

  // UI State
  const [showAddSection, setShowAddSection] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showOnHold, setShowOnHold] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState('all');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showTodoistImport, setShowTodoistImport] = useState(false);
  const [showImportSelection, setShowImportSelection] = useState(false);
  const [showArchiveToast, setShowArchiveToast] = useState(false);
  const [shadowBackupData, setShadowBackupData] = useState(null);
  const [showRestoreToast, setShowRestoreToast] = useState(false);

  const handleOpenRestoreShadow = () => {
    const shadowRaw = localStorage.getItem('123TodoShadowBackup');
    if (!shadowRaw) {
      alert("No shadow backup found on this browser.");
      return;
    }
    try {
      const data = JSON.parse(shadowRaw);
      setShadowBackupData(data);
    } catch (e) {
      alert("Shadow backup is corrupted or invalid.");
    }
  };

  const handleConfirmRestoreShadow = () => {
    if (shadowBackupData) {
      importData(shadowBackupData);
      setShadowBackupData(null);
      setShowRestoreToast(true);
      setTimeout(() => {
        setShowRestoreToast(false);
      }, 2000);
    }
  };

  const handleCompleteTask = (id) => {
    completeTask(id);
    setShowArchiveToast(true);
    setTimeout(() => {
      setShowArchiveToast(false);
    }, 2000);
  };

  // Filtering
  const filteredBySearch = (list) => list.filter(t =>
    t.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByProject = (list) => list.filter(t =>
    currentProjectId === 'all' || t.projectId === currentProjectId
  );

  const filteredTasks = filteredByProject(filteredBySearch(tasks));
  const filteredArchived = filteredByProject(filteredBySearch(archived));

  const activeTasksCount = tasks.filter(t => t.priority <= 3).length;
  const onHoldTasksFiltered = filteredTasks.filter(t => t.priority === 4);

  // Sync milestones when archived items change
  useEffect(() => {
    if (archived.length > 0) {
      const timer = setTimeout(() => checkMilestones(archived), 100);
      return () => clearTimeout(timer);
    }
  }, [archived, checkMilestones]);

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedId && draggedId !== targetId) {
      setDragOverId(targetId);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      reorderTasks(draggedId, targetId);
    }
    setDragOverId(null);
  };

  const handleDragEnd = (e) => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleExport = () => {
    const data = JSON.stringify({
      tasks,
      archived,
      projects
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `123todo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    recordBackup();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        importData(obj);
      } catch {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleTodoistImportData = (importedProjects) => {
    const allTasksToImport = [];

    importedProjects.forEach(ip => {
      // Create project or get existing if name matches (though addProject handles uniqueness)
      const projectId = addProject(ip.name, PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);

      const projectTasks = ip.tasks.map(t => ({
        text: t.text,
        priority: t.priority,
        projectId: projectId,
        notes: t.notes
      }));

      allTasksToImport.push(...projectTasks);
    });

    if (allTasksToImport.length > 0) {
      bulkAddTasks(allTasksToImport);
    }

    setShowAddSection(false);
    setShowTodoistImport(false);
  };

  const onRestoreRequest = (id) => {
    const priority = prompt('Restore to priority: 1 (Must Do), 2 (Should Do), 3 (Could Do), or 4 (On Hold)', '1');
    const p = parseInt(priority);
    if ([1, 2, 3, 4].includes(p)) {
      restoreTask(id, p);
    } else {
      alert('Invalid priority');
    }
  };

  const handleDeleteCategoryRequest = (id) => {
    const category = projects.find(p => p.id === id);
    if (!category) return;
    setCategoryToDelete(category);
  };

  const handleDeleteCategoryConfirm = (id, targetProjectId) => {
    deleteProject(id, targetProjectId);
    if (currentProjectId === id) {
      setCurrentProjectId(targetProjectId || 'all');
    }
    setCategoryToDelete(null);
  };

  const handleApplyUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  const styles = {
    appContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      paddingBottom: window.innerWidth < 768 ? '120px' : '80px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      width: '100%',
      background: 'var(--surface-color)',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginTop: '20px',
      flex: 1
    },
    sectionsContainer: {
      flex: 1,
      padding: '0 12px 8px 12px'
    },
    toggleSection: {
      padding: '12px',
      borderTop: '1px solid var(--border-color)',
      borderRadius: '8px 8px 0 0',
      margin: '0 8px 8px 8px'
    },
    toggleBtn: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      padding: '6px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      textAlign: 'left',
      width: '100%'
    }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.container}>
        <Header
          taskCount={activeTasksCount}
          onToggleAdd={() => setShowAddSection(!showAddSection)}
          isAddOpen={showAddSection}
        />

        <AddTask
          isOpen={showAddSection}
          onAdd={addTask}
          onClose={() => setShowAddSection(false)}
          projects={projects}
          defaultProjectId={currentProjectId}
        />

        {showInstallPrompt && (
          <InstallPrompt onInstall={() => { }} onDismiss={dismissInstallPrompt} />
        )}

        {showUpdateReady && (
          <UpdateReadyPrompt
            onBackup={() => {
              handleExport();
              // Keep showing update prompt so they can click 'Update Now' next
            }}
            onUpdate={handleApplyUpdate}
            onDismiss={() => setShowUpdateReady(false)}
          />
        )}

        {showBackupReminder && (
          <BackupReminder onBackup={handleExport} onDismiss={dismissBackupReminder} />
        )}

        {showSearch && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
          />
        )}

        <ProjectTabs
          projects={projects}
          currentProjectId={currentProjectId}
          onSelect={setCurrentProjectId}
          onAdd={addProject}
          onUpdate={updateProject}
          onDelete={handleDeleteCategoryRequest}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
        />

        {categoryToDelete && (
          <DeleteCategoryModal
            category={categoryToDelete}
            projects={projects}
            taskCount={tasks.filter(t => t.projectId === categoryToDelete.id).length + archived.filter(t => t.projectId === categoryToDelete.id).length}
            onConfirm={handleDeleteCategoryConfirm}
            onClose={() => setCategoryToDelete(null)}
          />
        )}

        <div style={styles.sectionsContainer}>
          {[1, 2, 3].map(priority => (
            <PrioritySection
              key={priority}
              priority={priority}
              tasks={filteredTasks}
              projects={projects}
              onComplete={handleCompleteTask}
              onEdit={setEditingTask}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              draggedId={draggedId}
              dragOverId={dragOverId}
            />
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted-text)' }}>
              {searchTerm ? 'No tasks matching your search.' : (currentProjectId === 'all' ? 'No tasks yet. Add one to get started!' : `No tasks in this category.`)}
            </div>
          )}
        </div>

        {onHoldTasksFiltered.length > 0 && (
          <div style={{ ...styles.toggleSection, background: 'var(--accent-bg)' }}>
            <button
              onClick={() => setShowOnHold(!showOnHold)}
              style={{ ...styles.toggleBtn, color: '#9333ea' }}
            >
              {showOnHold ? 'Hide' : 'Show'} On Hold ({onHoldTasksFiltered.length})
            </button>
            {showOnHold && (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <AnimatePresence mode="popLayout">
                  {onHoldTasksFiltered.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        projectColor={project?.color}
                        onComplete={handleCompleteTask}
                        onEdit={setEditingTask}
                      />
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        )}

        <div style={{ ...styles.toggleSection, background: 'var(--archive-bg)' }}>
          <button
            onClick={() => setShowArchive(!showArchive)}
            style={{ ...styles.toggleBtn, color: '#667eea' }}
          >
            {showArchive ? 'Hide' : 'Show'} Archive ({filteredArchived.length})
          </button>
          {showArchive && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
              <AnimatePresence mode="popLayout">
                {filteredArchived.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      projectColor={project?.color}
                      isArchived={true}
                      onRestore={onRestoreRequest}
                      onDelete={deleteArchivedTask}
                    />
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <Footer
          onExport={handleExport}
          onImportClick={() => setShowImportSelection(true)}
        />
        <input
          type="file"
          id="fileInput"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

      <SocialShare />

      {editingTask && (
        <EditModal
          task={editingTask}
          projects={projects}
          onSave={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {showWelcome && (
        <WelcomeModal onAccept={dismissWelcome} />
      )}

      {showCongrats && (
        <CongratsModal
          milestone={showCongrats.milestone}
          todayCompleted={showCongrats.todayCompleted}
          totalArchived={archived.length}
          onContinue={() => setShowCongrats(false)}
        />
      )}

      {showTodoistImport && (
        <TodoistImportModal
          projects={projects}
          onClose={() => setShowTodoistImport(false)}
          onImport={handleTodoistImportData}
        />
      )}

      {showImportSelection && (
        <ImportSelectionModal
          onJSONImport={() => document.getElementById('fileInput').click()}
          onTodoistImport={() => setShowTodoistImport(true)}
          onRestoreShadow={handleOpenRestoreShadow}
          onClose={() => setShowImportSelection(false)}
        />
      )}

      {shadowBackupData && (
        <RestoreShadowModal
          backupData={shadowBackupData}
          onConfirm={handleConfirmRestoreShadow}
          onClose={() => setShadowBackupData(null)}
        />
      )}

      <AnimatePresence>
        {showArchiveToast && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(1px)',
            zIndex: 10000,
            pointerEvents: 'none'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                padding: '16px 28px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--text-color)'
              }}
            >
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={18} strokeWidth={3} />
              </div>
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Moved to Archive</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRestoreToast && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(1px)',
            zIndex: 10000,
            pointerEvents: 'none'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                padding: '16px 28px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--text-color)'
              }}
            >
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={18} strokeWidth={3} />
              </div>
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Data Restored successfully</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoApp;