import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, Check } from 'lucide-react';

const TodoApp = () => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [archived, setArchived] = useState([]);
  const [counter, setCounter] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState(1);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showOnHold, setShowOnHold] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [achievedMilestones, setAchievedMilestones] = useState([]);
  const [lastMilestoneDate, setLastMilestoneDate] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const taskInputRef = React.useRef(null);

  // Styles object
  const styles = {
    body: {
      fontFamily: 'Inter, sans-serif',
      background: '#fafafa',
      color: '#333',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      fontSize: '15px'
    },
    appContainer: {
      maxWidth: '800px',
      margin: '0 auto',
      boxSizing: 'border-box'
    },
    container: {
      width: '100%',
      maxWidth: 'none',
      margin: '0 auto',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      border: '1px solid #ccc',
      padding: '12px 20px',
      boxSizing: 'border-box'
    },
    headerLogo: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#667eea'
    },
    taskCounter: {
      fontSize: '0.9rem',
      opacity: 0.8,
      color: '#6b7280',
      margin: '0 auto'
    },
    addTaskToggle: {
      background: 'none',
      border: 'none',
      color: '#333',
      fontSize: '1.05em',
      cursor: 'pointer',
      padding: '4px'
    },
    addSection: {
      padding: showAddSection ? '12px' : '0',
      background: '#ffffff',
      border: 'none',
      borderRadius: '0 0 8px 8px',
      maxHeight: showAddSection ? '280px' : '0',
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
    },
    taskInput: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '6px',
      resize: 'none',
      height: '40px',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
      background: '#ffffff',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    charCounter: {
      fontSize: '0.75rem',
      textAlign: 'right',
      marginTop: '4px',
      color: '#6b7280',
      fontWeight: '500'
    },
    prioritySelector: {
      display: 'flex',
      gap: '6px',
      margin: '10px 0',
      justifyContent: 'center',
      alignItems: 'center'
    },
    priorityBtn: {
      padding: '6px 8px',
      fontSize: '0.6rem',
      fontWeight: '600',
      border: '2px solid transparent',
      borderRadius: '5px',
      textAlign: 'center',
      cursor: 'pointer',
      background: '#f9fafb',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      textTransform: 'uppercase',
      letterSpacing: '0.2px',
      flex: '0 1 auto',
      whiteSpace: 'nowrap'
    },
    addBtn: {
      padding: '7px 16px',
      background: '#e0e7ff',
      color: '#4338ca',
      border: '2px solid #c7d2fe',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.65rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flex: '0 1 auto',
      whiteSpace: 'nowrap'
    },
    sectionsContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 12px 8px 12px'
    },
    sectionHeader: {
      fontSize: '0.85rem',
      fontWeight: '800',
      marginTop: '12px',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    tasksList: {
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    taskItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 12px',
      borderBottom: '1px solid #f3f4f6',
      background: 'white',
      cursor: 'move',
      borderRadius: '6px',
      marginBottom: '2px',
      transition: 'all 0.2s ease'
    },
    taskPriorityDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      marginRight: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    taskText: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      fontSize: '1rem',
      cursor: 'pointer',
      fontFamily: 'Inter, sans-serif',
      wordWrap: 'break-word',
      whiteSpace: 'normal'
    },
    actionBtn: {
      background: 'transparent',
      border: 'none',
      fontSize: '1.1rem',
      cursor: 'pointer',
      marginLeft: '8px',
      borderRadius: '4px',
      padding: '4px',
      transition: 'all 0.2s ease'
    },
    onHoldSection: {
      padding: '12px',
      background: '#faf5ff',
      borderTop: '1px solid #e5e7eb',
      borderRadius: '8px 8px 0 0',
      margin: '0 8px 8px 8px',
      display: 'block',
      visibility: 'visible'
    },
    archiveSection: {
      padding: '12px',
      background: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      borderRadius: '8px 8px 0 0',
      margin: '0 8px 8px 8px',
      display: 'block',
      visibility: 'visible'
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
      transition: 'all 0.2s ease'
    },
    footer: {
      flexShrink: 0,
      padding: '12px',
      paddingBottom: window.innerWidth < 768 ? '50px' : '36px',
      background: '#f9fafb',
      textAlign: 'center',
      fontSize: '0.8rem',
      borderTop: '1px solid #e5e7eb',
      color: '#6b7280'
    },
    adPanel: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '6px 12px',
      textAlign: 'center',
      fontSize: '0.7rem',
      fontWeight: '600',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    adPanelMobile: {
      minHeight: '40px',
      maxWidth: '100%',
      flexDirection: 'column',
      gap: '4px',
      padding: '4px 8px'
    },
    adPanelDesktop: {
      minHeight: '30px',
      maxWidth: '100%',
      flexDirection: 'row'
    },
    footerButton: {
      background: 'transparent',
      border: 'none',
      color: '#667eea',
      cursor: 'pointer',
      fontSize: '0.8rem',
      margin: '0 4px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#fff',
      padding: '16px',
      borderRadius: '8px',
      maxWidth: '90%',
      width: '320px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
    },
    welcomeModal: {
      background: '#fff',
      padding: '24px 20px',
      borderRadius: '16px',
      maxWidth: '90%',
      width: '500px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
      textAlign: 'center',
      maxHeight: '80vh',
      overflowY: 'auto'
    },
    congratsModal: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px 30px',
      borderRadius: '20px',
      maxWidth: '90%',
      width: '400px',
      textAlign: 'center',
      boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
    },
    installPrompt: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      margin: '8px 12px',
      display: showInstallPrompt ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.8rem',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
    },
    backupReminder: {
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      border: '1px solid #f59e0b',
      borderRadius: '6px',
      padding: '10px 12px',
      margin: '8px 12px',
      display: showBackupReminder ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.8rem',
      color: '#92400e'
    }
  };

  // Priority configurations
  const priorities = {
    1: { label: 'Must Do', color: '#dc2626', dotColor: '#dc2626' },
    2: { label: 'Should Do', color: '#f59e0b', dotColor: '#f59e0b' },
    3: { label: 'Could Do', color: '#6b7280', dotColor: '#6b7280' },
    4: { label: 'On Hold', color: '#9333ea', dotColor: '#9333ea' }
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('123TodoTasks');
      const savedArchived = localStorage.getItem('123TodoArchive');
      const savedCounter = localStorage.getItem('123TodoCounter');
      const savedMilestones = localStorage.getItem('123TodoMilestones');

      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedArchived) setArchived(JSON.parse(savedArchived));
      if (savedCounter) setCounter(parseInt(savedCounter));

      if (savedMilestones) {
        const milestoneData = JSON.parse(savedMilestones);
        setAchievedMilestones(milestoneData.achievedMilestones || []);
        setLastMilestoneDate(milestoneData.lastMilestoneDate || null);
      }

      // Check welcome screen
      const hasSeenWelcome = localStorage.getItem('123TodoWelcomeSeen');
      if (!hasSeenWelcome) {
        setTimeout(() => setShowWelcome(true), 500);
      }

      // Check backup reminder
      checkBackupReminder();

      // Add sample tasks if new user
      if (!savedTasks && !savedArchived) {
        initializeSampleTasks();
      }

      // Check install prompt
      setTimeout(() => checkInstallPrompt(), 2000);

    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      initializeSampleTasks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize sample tasks for new users
  const initializeSampleTasks = useCallback(() => {
    const userDataKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('123Todo') && 
      !key.includes('Milestones') && 
      !key.includes('InstallDismissed') && 
      !key.includes('LastInstallPrompt')
    );
    
    if (userDataKeys.length === 0) {
      const sampleTasks = [
        { id: 1, text: "🎯 Complete this task to mark it as done! (Tap the ✓ button)", priority: 1, isSample: true },
        { id: 2, text: "📝 Click on any task to edit its text and priority level", priority: 1, isSample: true },
        { id: 3, text: "📝 Try the + button to add your own tasks", priority: 2, isSample: true },
        { id: 4, text: "🏆 Complete 5 tasks to unlock your first achievement!", priority: 2, isSample: true },
        { id: 5, text: "💡 Drag and drop tasks to reorder them within each priority", priority: 3, isSample: true },
        { id: 6, text: "📱 Install this app on your home screen for quick access", priority: 3, isSample: true },
        { id: 7, text: "📊 Check the Archive section to see completed tasks", priority: 3, isSample: true }
      ];
      setTasks(sampleTasks);
      setCounter(7);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('123TodoTasks', JSON.stringify(tasks));
    localStorage.setItem('123TodoArchive', JSON.stringify(archived));
    localStorage.setItem('123TodoCounter', counter.toString());
  }, [tasks, archived, counter]);

  // Check for milestone achievements
  const checkMilestones = useCallback(() => {
    const today = new Date().toDateString();
    
    // Reset milestones for new day
    if (lastMilestoneDate !== today) {
      setAchievedMilestones([]);
      setLastMilestoneDate(today);
    }
    
    const todayCompleted = archived.filter(task => {
      return new Date(task.completedAt).toDateString() === today;
    }).length;

    const milestones = [5, 10, 15];
    
    for (let milestone of milestones) {
      if (todayCompleted >= milestone && !achievedMilestones.includes(milestone)) {
        setAchievedMilestones(prev => [...prev, milestone]);
        showMilestoneModal(milestone, todayCompleted);
        break;
      }
    }
  }, [archived, achievedMilestones, lastMilestoneDate]);

  // Show milestone celebration modal
  const showMilestoneModal = (milestone, todayCompleted) => {
    setShowCongrats({ milestone, todayCompleted });
  };

  // Check backup reminder
  const checkBackupReminder = useCallback(() => {
    const lastBackup = localStorage.getItem('123TodoLastBackup');
    const lastReminderDismiss = localStorage.getItem('123TodoReminderDismissed');
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const shouldShowReminder = (!lastBackup || (now - parseInt(lastBackup)) > sevenDays) &&
                              (!lastReminderDismiss || (now - parseInt(lastReminderDismiss)) > sevenDays);

    if (shouldShowReminder && tasks.length > 0) {
      setShowBackupReminder(true);
    }
  }, [tasks.length]);

  // Check install prompt
  const checkInstallPrompt = () => {
    const installDismissed = localStorage.getItem('123TodoInstallDismissed');
    const lastInstallPrompt = localStorage.getItem('123TodoLastInstallPrompt');
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    
    if (!installDismissed && (!lastInstallPrompt || (now - parseInt(lastInstallPrompt)) > threeDays)) {
      if (!window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone) {
        setShowInstallPrompt(true);
        localStorage.setItem('123TodoLastInstallPrompt', now);
      }
    }
  };

  // Add new task
  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask = {
      id: counter + 1,
      text: newTaskText.trim(),
      priority: selectedPriority,
      isSample: false
    };
    
    setTasks(prev => [newTask, ...prev]);
    setCounter(prev => prev + 1);
    setNewTaskText('');
    setShowAddSection(false);
  };

  // Complete task and move to archive
  const completeTask = (id) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const [task] = tasks.splice(taskIndex, 1);
    const completedTask = {
      ...task,
      completedAt: Date.now()
    };

    setTasks([...tasks]);
    setArchived(prev => [completedTask, ...prev]);
    
    // Check milestones after completing task
    setTimeout(checkMilestones, 100);
  };

  // Delete task from archive
  const deleteArchivedTask = (id) => {
    setArchived(prev => prev.filter(t => t.id !== id));
  };

  // Restore task from archive
  const restoreTask = (id) => {
    const taskIndex = archived.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const priority = prompt('Restore to priority: 1 (Must Do), 2 (Should Do), 3 (Could Do), or 4 (On Hold)', '1');
    const p = parseInt(priority);
    
    if ([1,2,3,4].includes(p)) {
      const [task] = archived.splice(taskIndex, 1);
      const restoredTask = {
        ...task,
        priority: p
      };
      delete restoredTask.completedAt;

      setArchived([...archived]);
      setTasks(prev => [restoredTask, ...prev]);
    } else {
      alert('Invalid priority');
    }
  };

  // Edit task
  const saveEditedTask = () => {
    if (!editingTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, text: editingTask.text, priority: editingTask.priority, isSample: false }
        : task
    ));
    setEditingTask(null);
  };

  // Export tasks
  const exportTasks = () => {
    const data = JSON.stringify({ tasks, archived, counter }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `123todo-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    localStorage.setItem('123TodoLastBackup', Date.now());
    setShowBackupReminder(false);
  };

  // Import tasks
  const importTasks = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        setTasks(obj.tasks || []);
        setArchived(obj.archived || []);
        setCounter(obj.counter || 0);
      } catch {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  };

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
    if (!draggedId || draggedId === targetId) return;
    
    const fromIndex = tasks.findIndex(t => t.id === draggedId);
    const toIndex = tasks.findIndex(t => t.id === targetId);
    
    if (fromIndex > -1 && toIndex > -1) {
      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, movedTask);
      setTasks(newTasks);
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedId(null);
  };

  // Get priority button style
  const getPriorityButtonStyle = (priority, isActive) => {
    const config = priorities[priority];
    return {
      ...styles.priorityBtn,
      color: isActive ? 'white' : config.color,
      backgroundColor: isActive ? config.color : '#f9fafb',
      borderColor: config.color
    };
  };

  // Render task item
  const renderTaskItem = (task, isArchived = false) => (
    <li 
      key={task.id}
      style={{
        ...styles.taskItem,
        backgroundColor: task.isSample ? '#f0f9ff' : 'white',
        borderLeft: task.isSample ? '4px solid #0ea5e9' : 'none',
        cursor: isArchived ? 'default' : 'move'
      }}
      draggable={!isArchived}
      onDragStart={(e) => !isArchived && handleDragStart(e, task.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => !isArchived && handleDrop(e, task.id)}
      onDragEnd={handleDragEnd}
      onClick={() => !isArchived && setEditingTask({...task})}
    >
      <div style={{
        ...styles.taskPriorityDot,
        backgroundColor: priorities[task.priority]?.dotColor || '#6b7280'
      }}></div>
      <span style={styles.taskText}>{task.text}</span>
      {isArchived ? (
        <div style={{ display: 'flex' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); restoreTask(task.id); }}
            style={{ ...styles.actionBtn, color: '#3b82f6' }}
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteArchivedTask(task.id); }}
            style={{ ...styles.actionBtn, color: '#dc2626' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button 
          onClick={(e) => { e.stopPropagation(); completeTask(task.id); }}
          style={{ ...styles.actionBtn, color: '#10b981' }}
        >
          <Check size={16} />
        </button>
      )}
    </li>
  );

  const activeTasks = tasks.filter(t => t.priority <= 3);
  const onHoldTasks = tasks.filter(t => t.priority === 4);

  return (
    <div style={styles.body}>
      <div style={styles.appContainer}>
        <div style={styles.container}>
          {/* Header */}
          <header style={styles.header}>
            <a href="https://www.123todo.com" target="_blank" rel="noreferrer" style={{ display: 'block' }}>
             <img
  src="/123-logo-500px.jpg"
  alt="123 ToDo logo"
  style={{
    width: '200px',
    height: 'auto',
    cursor: 'pointer'
  }}
/>
            </a>
            <div style={styles.taskCounter}>{activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}</div>
            <button
              onClick={() => {
                setShowAddSection(!showAddSection);
                if (!showAddSection) {
                  setTimeout(() => taskInputRef.current?.focus(), 100);
                }
              }}
              style={styles.addTaskToggle}
            >
              {showAddSection ? '➖' : '➕'}
            </button>
          </header>

          {/* Add Task Section */}
          <div style={styles.addSection}>
            <textarea
              ref={taskInputRef}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addTask();
                }
              }}
              placeholder="What needs to be done?"
              style={styles.taskInput}
              maxLength="200"
            />
            <div style={styles.charCounter}>{newTaskText.length}/200</div>
            
            {/* Priority Selector */}
            <div style={styles.prioritySelector}>
              {[1, 2, 3].map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  style={getPriorityButtonStyle(priority, selectedPriority === priority)}
                >
                  {priorities[priority].label}
                </button>
              ))}
              <button
                onClick={addTask}
                style={styles.addBtn}
              >
                ADD
              </button>
            </div>
          </div>

          {/* Install App Prompt */}
          <div style={styles.installPrompt}>
            <div style={{ flex: 1, fontWeight: '600' }}>
              Add 123 To Do to your home screen for easy access!
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ 
                background: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.3)', 
                borderRadius: '4px', 
                padding: '4px 8px', 
                fontSize: '0.75rem', 
                cursor: 'pointer' 
              }}>
                Install
              </button>
              <button 
                onClick={() => {
                  setShowInstallPrompt(false);
                  localStorage.setItem('123TodoInstallDismissed', 'true');
                }}
                style={{ 
                  background: 'transparent', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.5)', 
                  borderRadius: '4px', 
                  padding: '4px 8px', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer' 
                }}
              >
                Not Now
              </button>
            </div>
          </div>

          {/* Backup Reminder */}
          <div style={styles.backupReminder}>
            <div style={{ flex: 1, fontWeight: '600' }}>
              📝 It's been a week! Don't forget to backup your tasks.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={exportTasks}
                style={{ 
                  background: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '4px 8px', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer' 
                }}
              >
                Backup Now
              </button>
              <button 
                onClick={() => {
                  setShowBackupReminder(false);
                  localStorage.setItem('123TodoReminderDismissed', Date.now());
                }}
                style={{ 
                  background: 'transparent', 
                  color: '#92400e', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '4px', 
                  padding: '4px 8px', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer' 
                }}
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Task Lists */}
          <div style={styles.sectionsContainer}>
            {[1, 2, 3].map(priority => (
              <div key={priority}>
                <h3 style={{
                  ...styles.sectionHeader,
                  color: priorities[priority].color
                }}>
                  {priorities[priority].label}
                </h3>
                <ul style={styles.tasksList}>
                  {tasks
                    .filter(t => t.priority === priority)
                    .map(task => renderTaskItem(task))}
                </ul>
              </div>
            ))}
          </div>

          {/* On Hold Section */}
          {onHoldTasks.length > 0 && (
            <div style={styles.onHoldSection}>
              <button 
                onClick={() => setShowOnHold(!showOnHold)}
                style={{ ...styles.toggleBtn, color: '#9333ea' }}
              >
                {showOnHold ? 'Hide' : 'Show'} On Hold ({onHoldTasks.length})
              </button>
              {showOnHold && (
                <ul style={styles.tasksList}>
                  {onHoldTasks.map(task => renderTaskItem(task))}
                </ul>
              )}
            </div>
          )}

          {/* Archive Section */}
          <div style={styles.archiveSection}>
            <button 
              onClick={() => setShowArchive(!showArchive)}
              style={{ ...styles.toggleBtn, color: '#667eea' }}
            >
              {showArchive ? 'Hide' : 'Show'} Archive ({archived.length})
            </button>
            {showArchive && (
              <ul style={{ ...styles.tasksList, maxHeight: '200px', overflowY: 'auto' }}>
                {archived.map(task => renderTaskItem(task, true))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <footer style={styles.footer}>
            <button onClick={exportTasks} style={styles.footerButton}>Export</button>
            <span> | </span>
            <button onClick={() => document.getElementById('fileInput').click()} style={styles.footerButton}>Import</button>
            <input 
              type="file" 
              id="fileInput" 
              accept=".json" 
              style={{ display: 'none' }}
              onChange={importTasks}
            />
            <br />
            Copyright © Darron Hartas 2025 | v1.0.7
            <br />
            <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
              <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none', marginRight: '16px' }}>
                Terms of Service
              </a>
              <a href="https://www.123todo.com/privacy" target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </div>
          </footer>
        </div>

        {/* Edit Modal */}
        {editingTask && (
          <div style={styles.modal} onClick={() => setEditingTask(null)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <textarea
                value={editingTask.text}
                onChange={(e) => setEditingTask({...editingTask, text: e.target.value})}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  resize: 'none',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  minHeight: '60px',
                  maxHeight: '300px',
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box'
                }}
                maxLength="200"
                ref={(textarea) => {
                  if (textarea) {
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                  }
                }}
              />
              <select 
                value={editingTask.priority}
                onChange={(e) => setEditingTask({...editingTask, priority: parseInt(e.target.value)})}
                style={{ 
                  width: '100%', 
                  padding: '6px', 
                  fontSize: '0.875rem', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px', 
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              >
                {Object.entries(priorities).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '12px' }}>
                {editingTask.text.length}/200
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  onClick={() => setEditingTask(null)}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.875rem', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    background: '#e5e7eb' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveEditedTask}
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.875rem', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    background: '#2563eb', 
                    color: '#fff' 
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Modal */}
        {showWelcome && (
          <div style={styles.modal}>
            <div style={styles.welcomeModal}>
              <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '1.5rem', fontWeight: '700' }}>
                Welcome to 123 To Do!
              </h2>
              <div style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '1rem' }}>
                A sophisticated task management app with offline support
              </div>
              
              <div style={{ 
                background: '#f0f4ff', 
                border: '1px solid #c7d2fe', 
                borderRadius: '8px', 
                padding: '16px', 
                margin: '16px 0', 
                fontSize: '0.85rem', 
                textAlign: 'left' 
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#3730a3', fontSize: '0.9rem' }}>
                  For mobile use - Install as Home Screen App
                </h4>
                <div style={{ marginBottom: '12px' }}>
                  <strong>iPhone/iPad:</strong>
                  <ol style={{ margin: '8px 0 0 16px', color: '#4338ca' }}>
                    <li>Tap the Share button (square with arrow)</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Android:</strong>
                  <ol style={{ margin: '8px 0 0 16px', color: '#4338ca' }}>
                    <li>Tap the menu button (3 dots)</li>
                    <li>Tap "Add to Home screen" or "Install app"</li>
                    <li>Tap "Add" or "Install" to confirm</li>
                  </ol>
                </div>
                <p><strong>Benefits:</strong> Works offline with faster loading.</p>
              </div>
              
              <div style={{ 
                background: '#f9fafb', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '20px', 
                margin: '20px 0', 
                textAlign: 'left', 
                fontSize: '0.85rem', 
                lineHeight: '1.5' 
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>
                  🛡️ Important Notice - Terms of Use
                </h4>
                <p style={{ margin: '0 0 8px 0', color: '#4b5563' }}>
                  <strong>Use at Your Own Risk:</strong> This application is provided "as is" without warranties. You use this software entirely at your own risk.
                </p>
                <p style={{ margin: '0 0 8px 0', color: '#4b5563' }}>
                  <strong>Data Responsibility:</strong> You are solely responsible for backing up your data. We recommend regular exports of your tasks.
                </p>
                <p style={{ margin: '0 0 8px 0', color: '#4b5563' }}>
                  <strong>Local Storage:</strong> Your data is stored locally in your browser and may be lost due to browser settings, updates, or other factors beyond our control.
                </p>
                <p style={{ margin: '0', color: '#4b5563' }}>
                  For complete terms: <a href="https://www.123todo.com/terms" target="_blank" rel="noreferrer" style={{ color: '#667eea', textDecoration: 'none' }}>www.123todo.com/terms</a>
                </p>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => window.open('https://www.123todo.com/terms', '_blank')}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  View Terms First
                </button>
                <button 
                  onClick={() => {
                    setShowWelcome(false);
                    localStorage.setItem('123TodoWelcomeSeen', 'true');
                    localStorage.setItem('123TodoTermsAccepted', Date.now());
                  }}
                  style={{ 
                    padding: '12px 24px', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    cursor: 'pointer', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white' 
                  }}
                >
                  I Understand, Let's Start!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Congratulations Modal */}
        {showCongrats && (
          <div style={styles.modal}>
            <div style={styles.congratsModal}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                Congratulations!
              </div>
              <div style={{ fontSize: '1.1rem', marginBottom: '20px', opacity: 0.9, lineHeight: '1.4' }}>
                You've completed {showCongrats.milestone} tasks today!
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '10px', 
                padding: '15px', 
                margin: '20px 0', 
                backdropFilter: 'blur(10px)' 
              }}>
                <div>Tasks Completed Today: <strong>{showCongrats.todayCompleted}</strong></div>
                <div>Total All Time: <strong>{archived.length}</strong></div>
                <div>Keep going you're on a roll! 🚀</div>
              </div>
              <button 
                onClick={() => setShowCongrats(false)}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  color: 'white', 
                  padding: '12px 30px', 
                  borderRadius: '25px', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  cursor: 'pointer', 
                  marginTop: '10px' 
                }}
              >
                Continue Being Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Social Share Panel - Sticky Footer */}
        <div
          style={{
            ...styles.adPanel,
            ...(window.innerWidth < 768 ? styles.adPanelMobile : styles.adPanelDesktop)
          }}
        >
          <span style={{ fontSize: window.innerWidth < 768 ? '0.7rem' : '0.75rem', marginRight: window.innerWidth < 768 ? '0' : '8px' }}>
            Keep this App free - please SHARE!
          </span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* X (Twitter) Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out 123 ToDo - Simple, FREE powerful task management with offline support!')}&url=${encodeURIComponent('https://123todo.com')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '4px',
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              title="Share on X (Twitter)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Facebook Share */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://123todo.com')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '4px',
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              title="Share on Facebook"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* LinkedIn Share */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://123todo.com')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '4px',
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              title="Share on LinkedIn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>

            {/* Email Share */}
            <a
              href={`mailto:?subject=${encodeURIComponent('Check out 123 ToDo - FREE Task Management')}&body=${encodeURIComponent('I found this great FREE task management app: https://123todo.com - Simple, powerful task management with offline support!')}`}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '4px',
                color: 'white',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              title="Share via Email"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoApp;