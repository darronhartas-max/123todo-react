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
import DeleteProjectModal from './components/modals/DeleteProjectModal';
import SettingsModal from './components/modals/SettingsModal';
import ProjectTabs from './components/projects/ProjectTabs';
import EditModal from './components/modals/EditModal';
import WelcomeModal from './components/modals/WelcomeModal';
import CongratsModal from './components/modals/CongratsModal';
import TodoistImportModal from './components/modals/TodoistImportModal';
import ImportSelectionModal from './components/modals/ImportSelectionModal';
import RestoreShadowModal from './components/modals/RestoreShadowModal';
import SyncModal from './components/modals/SyncModal';
import UpdatedModal from './components/modals/UpdatedModal';
import { InstallPrompt, BackupReminder, UpdateReadyPrompt } from './components/layout/NotificationBar';
import { useTasks } from './hooks/useTasks';
import { useAppSystem } from './hooks/useAppSystem';
import { useGoogleDriveSync } from './hooks/useGoogleDriveSync';
import { PROJECT_COLORS, DEFAULT_PROJECTS, APP_VERSION } from './utils/constants';

const TodoApp = () => {
  const {
    tasks, archived, projects, counter, timestamp, addTask, completeTask, deleteArchivedTask,
    restoreTask, updateTask, reorderTasks, addProject, updateProject, deleteProject, importData, bulkAddTasks
  } = useTasks();

  const {
    isAuthed, syncStatus, passphrase, setPassphrase, signIn, signOut, performSync
  } = useGoogleDriveSync({ tasks, archived, projects, counter, timestamp }, importData);

  const {
    showWelcome, showInstallPrompt, showBackupReminder, showCongrats,
    showUpdateReady, swRegistration,
    setShowCongrats, setShowUpdateReady, checkMilestones, dismissWelcome, dismissInstallPrompt,
    dismissBackupReminder, recordBackup
  } = useAppSystem(archived.length, tasks.length, isAuthed);

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
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showTodoistImport, setShowTodoistImport] = useState(false);
  const [showImportSelection, setShowImportSelection] = useState(false);
  const [showArchiveToast, setShowArchiveToast] = useState(false);
  const [shadowBackupData, setShadowBackupData] = useState(null);
  const [showRestoreToast, setShowRestoreToast] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpdatedModal, setShowUpdatedModal] = useState(false);
  const [prevVersionStr, setPrevVersionStr] = useState('');

  // Check if we just completed an update and should show the update confirmation modal
  useEffect(() => {
    const showModal = localStorage.getItem('123Todo_Show_Updated_Modal') === 'true';
    const prevVersion = localStorage.getItem('123Todo_Previous_Version');
    if (showModal && prevVersion && prevVersion !== APP_VERSION) {
      setPrevVersionStr(prevVersion);
      setShowUpdatedModal(true);
    } else {
      localStorage.removeItem('123Todo_Show_Updated_Modal');
      localStorage.removeItem('123Todo_Previous_Version');
    }
  }, []);

  // Preference state loaded from localStorage or default
  const [fontSize, setFontSizeState] = useState(() => {
    const saved = localStorage.getItem('123TodoFontSize');
    if (saved && parseInt(saved) >= 14) return 12; // Migrate px to pt default
    return saved ? parseInt(saved) : 12;
  });
  const [density, setDensityState] = useState(() => {
    return localStorage.getItem('123TodoDensity') || 'cozy';
  });
  const [layoutWidth, setLayoutWidthState] = useState(() => {
    const saved = localStorage.getItem('123TodoLayoutWidth');
    if (saved === '800px' || saved === '1200px') return '480px';
    return saved || '480px';
  });
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem('123TodoThemeMode') || 'system';
  });
  const [isDark, setIsDark] = useState(false);

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('123TodoFontSize', size.toString());
  };
  const setDensity = (val) => {
    setDensityState(val);
    localStorage.setItem('123TodoDensity', val);
  };
  const setLayoutWidth = (val) => {
    setLayoutWidthState(val);
    localStorage.setItem('123TodoLayoutWidth', val);
  };
  const setThemeMode = (val) => {
    setThemeModeState(val);
    localStorage.setItem('123TodoThemeMode', val);
  };

  // Apply visual styling settings to root element
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}pt`;
  }, [fontSize]);

  useEffect(() => {
    if (density === 'compact') {
      document.documentElement.style.setProperty('--task-padding', '6px 12px');
      document.documentElement.style.setProperty('--task-padding-top', '8px');
      document.documentElement.style.setProperty('--task-margin', '2px');
      document.documentElement.style.setProperty('--section-margin', '10px');
    } else {
      document.documentElement.style.removeProperty('--task-padding');
      document.documentElement.style.removeProperty('--task-padding-top');
      document.documentElement.style.removeProperty('--task-margin');
      document.documentElement.style.removeProperty('--section-margin');
    }
  }, [density]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcut keys if user is typing in an input, select, or textarea
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable
      )) {
        // Allow Escape to blur the input/textarea (unfocus it)
        if (e.key === 'Escape') {
          activeEl.blur();
        }
        return;
      }

      // Ignore shortcuts if command, control, or alt/option modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 1. "a" or "q" to toggle Add Task Panel
      if (e.key === 'a' || e.key === 'q') {
        e.preventDefault();
        setShowAddSection(prev => !prev);
      }

      // 2. "/" to focus Search Bar
      if (e.key === '/') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          document.getElementById('searchInput')?.focus();
        }, 50);
      }

      // 3. "s" to open Settings
      if (e.key === 's') {
        e.preventDefault();
        setShowSettings(true);
      }

      // 4. "Esc" to close active modal or Add Task Panel
      if (e.key === 'Escape') {
        if (editingTask) {
          setEditingTask(null);
        } else if (showSettings) {
          setShowSettings(false);
        } else if (showAddSection) {
          setShowAddSection(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTask, showSettings, showAddSection]);

  useEffect(() => {
    const root = document.documentElement;
    
    const updateTheme = () => {
      let darkActive = false;
      if (themeMode === 'system') {
        darkActive = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        darkActive = themeMode === 'dark';
      }
      
      root.classList.remove('theme-light', 'theme-dark');
      if (themeMode === 'light') {
        root.classList.add('theme-light');
      } else if (themeMode === 'dark') {
        root.classList.add('theme-dark');
      }
      
      setIsDark(darkActive);
    };

    updateTheme();

    if (themeMode === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [themeMode]);

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
      let projectId;

      if (ip.targetProjectId) {
        // Phase 2: user mapped this CSV to an existing project — use it directly
        projectId = ip.targetProjectId;
      } else {
        // Phase 1 fix: case-insensitive duplicate guard before creating a new project
        const existingMatch = projects.find(
          p => p.name.toLowerCase() === ip.name.toLowerCase()
        );
        if (existingMatch) {
          projectId = existingMatch.id;
        } else {
          projectId = addProject(ip.name, ip.color || PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);
        }
      }

      const projectTasks = ip.tasks.map(t => ({
        text: t.text,
        priority: t.priority,
        projectId: projectId,
        notes: t.notes || ''
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

  const handleDeleteProjectRequest = (id) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    setProjectToDelete(project);
  };

  const handleDeleteProjectConfirm = (id, targetProjectId) => {
    deleteProject(id, targetProjectId);
    if (currentProjectId === id) {
      setCurrentProjectId(targetProjectId || 'all');
    }
    setProjectToDelete(null);
  };

  const handleApplyUpdate = () => {
    localStorage.setItem('123Todo_Previous_Version', APP_VERSION);
    localStorage.setItem('123Todo_Show_Updated_Modal', 'true');

    if (swRegistration && swRegistration.waiting) {
      // Set up listener for Service Worker takeover to trigger page reload
      const onControllerChange = () => {
        window.location.reload();
      };
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
      }
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Fallback: reload anyway in 2 seconds in case controllerchange doesn't fire
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      window.location.reload();
    }
  };

  const styles = {
    appContainer: {
      maxWidth: layoutWidth,
      margin: '0 auto',
      paddingBottom: window.innerWidth < 768 ? '120px' : '80px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'max-width 0.3s ease'
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
      padding: '0 12px 8px 12px',
      display: 'flex',
      flexDirection: window.innerWidth > 768 && layoutWidth !== '480px' ? 'row' : 'column',
      gap: window.innerWidth > 768 && layoutWidth !== '480px' ? '20px' : '0px',
      alignItems: 'stretch'
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
          isDark={isDark}
        />

        <AddTask
          isOpen={showAddSection}
          onAdd={addTask}
          onClose={() => setShowAddSection(false)}
          projects={[...DEFAULT_PROJECTS.filter(p => p.id !== 'all'), ...projects]}
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
          onDelete={handleDeleteProjectRequest}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {projectToDelete && (
          <DeleteProjectModal
            project={projectToDelete}
            projects={projects}
            taskCount={tasks.filter(t => t.projectId === projectToDelete.id).length + archived.filter(t => t.projectId === projectToDelete.id).length}
            onConfirm={handleDeleteProjectConfirm}
            onClose={() => setProjectToDelete(null)}
          />
        )}

        <div style={styles.sectionsContainer}>
          {[1, 2, 3].map(priority => (
            <PrioritySection
              key={priority}
              priority={priority}
              tasks={filteredTasks}
              projects={[...DEFAULT_PROJECTS, ...projects]}
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
              {searchTerm ? 'No tasks matching your search.' : (currentProjectId === 'all' ? 'No tasks yet. Add one to get started!' : `No tasks in this project.`)}
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
                    const project = [...DEFAULT_PROJECTS, ...projects].find(p => 
                      p.id.toLowerCase() === task.projectId?.toLowerCase() || 
                      p.name.toLowerCase() === task.projectId?.toLowerCase()
                    );
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
                  const project = [...DEFAULT_PROJECTS, ...projects].find(p => 
                    p.id.toLowerCase() === task.projectId?.toLowerCase() || 
                    p.name.toLowerCase() === task.projectId?.toLowerCase()
                  );
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
          onSyncClick={() => setShowSyncModal(true)}
          syncStatus={syncStatus}
          isAuthed={isAuthed}
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
          projects={[...DEFAULT_PROJECTS.filter(p => p.id !== 'all'), ...projects]}
          onSave={updateTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {showUpdatedModal && (
        <UpdatedModal
          oldVersion={prevVersionStr}
          newVersion={APP_VERSION}
          onClose={() => {
            setShowUpdatedModal(false);
            localStorage.removeItem('123Todo_Show_Updated_Modal');
            localStorage.removeItem('123Todo_Previous_Version');
          }}
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

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        isAuthed={isAuthed}
        syncStatus={syncStatus}
        passphrase={passphrase}
        setPassphrase={setPassphrase}
        signIn={signIn}
        signOut={signOut}
        performSync={performSync}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        projects={projects}
        onAddProject={addProject}
        onEditProject={updateProject}
        onDeleteProject={handleDeleteProjectRequest}
        fontSize={fontSize}
        setFontSize={setFontSize}
        density={density}
        setDensity={setDensity}
        layoutWidth={layoutWidth}
        setLayoutWidth={setLayoutWidth}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

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