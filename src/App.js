import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SocialShare from './components/layout/SocialShare';
import AddTask from './components/tasks/AddTask';
import PrioritySection from './components/tasks/PrioritySection';
import TaskItem from './components/tasks/TaskItem';
import SearchBar from './components/tasks/SearchBar';
import ProjectTabs from './components/projects/ProjectTabs';
import EditModal from './components/modals/EditModal';
import WelcomeModal from './components/modals/WelcomeModal';
import CongratsModal from './components/modals/CongratsModal';
import { InstallPrompt, BackupReminder } from './components/layout/NotificationBar';
import { useTasks } from './hooks/useTasks';
import { useAppSystem } from './hooks/useAppSystem';

const TodoApp = () => {
  const {
    tasks, archived, projects, addTask, completeTask, deleteArchivedTask,
    restoreTask, updateTask, reorderTasks, addProject, updateProject, deleteProject, importData
  } = useTasks();

  const {
    showWelcome, showInstallPrompt, showBackupReminder, showCongrats,
    setShowCongrats, checkMilestones, dismissWelcome, dismissInstallPrompt,
    dismissBackupReminder, recordBackup
  } = useAppSystem(archived.length, tasks.length);

  // UI State
  const [showAddSection, setShowAddSection] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showOnHold, setShowOnHold] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState('all');

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
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      reorderTasks(draggedId, targetId);
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedId(null);
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

  const onRestoreRequest = (id) => {
    const priority = prompt('Restore to priority: 1 (Must Do), 2 (Should Do), 3 (Could Do), or 4 (On Hold)', '1');
    const p = parseInt(priority);
    if ([1, 2, 3, 4].includes(p)) {
      restoreTask(id, p);
    } else {
      alert('Invalid priority');
    }
  };

  const styles = {
    appContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      paddingBottom: '80px',
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
      fontSize: '0.8rem',
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

        {showBackupReminder && (
          <BackupReminder onBackup={handleExport} onDismiss={dismissBackupReminder} />
        )}

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={() => setSearchTerm('')}
        />

        <ProjectTabs
          projects={projects}
          currentProjectId={currentProjectId}
          onSelect={setCurrentProjectId}
          onAdd={addProject}
          onUpdate={updateProject}
          onDelete={deleteProject}
        />

        <div style={styles.sectionsContainer}>
          {[1, 2, 3].map(priority => (
            <PrioritySection
              key={priority}
              priority={priority}
              tasks={filteredTasks}
              projects={projects}
              onComplete={completeTask}
              onEdit={setEditingTask}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
            />
          ))}

          {filteredTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted-text)' }}>
              {searchTerm ? 'No tasks matching your search.' : (currentProjectId === 'all' ? 'No tasks yet. Add one to get started!' : 'No tasks in this project.')}
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
                        onComplete={completeTask}
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
          onImportClick={() => document.getElementById('fileInput').click()}
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
    </div>
  );
};

export default TodoApp;