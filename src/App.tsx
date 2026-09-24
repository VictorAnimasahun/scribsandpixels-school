import { useState } from 'react'
import './App.css'
import { curriculum, dailyTask } from './data/curriculum'

function App() {
  const [completed, setCompleted] = useState(false)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>scribs<span className="brand-pixel">&pixels</span></span></div>
        <div className="profile-card"><div className="avatar">VA</div><div><strong>Victor</strong><span>Apprentice builder</span></div><span className="status-dot" /></div>
        <nav aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          <a className="nav-item active" href="#dashboard"><span>▦</span>Dashboard</a>
          <a className="nav-item" href="#curriculum"><span>⌘</span>Curriculum <b>7</b></a>
          <a className="nav-item" href="#projects"><span>◇</span>Projects</a>
          <a className="nav-item" href="#review"><span>↺</span>Review deck <b className="alert-count">12</b></a>
          <p className="nav-label second">Accountability</p>
          <a className="nav-item" href="#streak"><span>✦</span>My streak</a>
          <a className="nav-item" href="#settings"><span>⚙</span>Settings</a>
        </nav>
        <div className="sidebar-footer"><div className="target-icon">◒</div><strong>Daily target</strong><span>Keep the chain alive</span><div className="mini-progress"><i /></div><small>4 of 5 days this week</small></div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar"><div className="breadcrumb">Thursday, September 3 <span>/</span> Week 02</div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♢<i /></button><button className="help-button">Need a nudge?</button><div className="small-avatar">V</div></div></header>
        <section className="welcome-row"><div><p className="eyebrow">YOUR COMMAND CENTER</p><h1>Good morning, Victor.</h1><p className="subhead">One focused session today keeps your future self in motion.</p></div><div className="streak-badge"><span>✦</span><div><strong>6 day streak</strong><small>Best: 12 days</small></div></div></section>

        <section className="hero-task">
          <div className="task-copy"><div className="task-kicker"><span className="live-dot" />TODAY'S NON-NEGOTIABLE</div><h2>{dailyTask.title}<br /><em>{dailyTask.accent}</em></h2><p>{dailyTask.description}</p><div className="task-meta"><span>◷ {dailyTask.duration}</span><span>▣ {dailyTask.category}</span><span>⚑ {dailyTask.level}</span></div><button className={completed ? 'start-button complete' : 'start-button'} onClick={() => setCompleted(!completed)}>{completed ? 'Task complete ✓' : 'Start today’s build'} <span>{completed ? '' : '→'}</span></button></div>
          <div className="hero-art" aria-hidden="true"><div className="code-window"><div className="window-bar"><i /><i /><i /><span>script.js</span></div><div className="code-lines">{dailyTask.code.map((line, index) => <span className={index === 5 ? 'highlight' : ''} key={`${line}-${index}`}><b>{String(index + 1).padStart(2, '0')}</b> {line}</span>)}</div></div><div className="cursor-arrow">↗</div><div className="spark one">✦</div><div className="spark two">✦</div></div>
        </section>

        <section className="lower-grid"><div className="section-block" id="curriculum"><div className="section-heading"><div><p className="eyebrow">THE LONG GAME</p><h2>Your path to hero</h2></div><a href="#curriculum">See full curriculum →</a></div><div className="path-list">{curriculum.map((item) => <div className={`path-item ${item.status}`} key={item.id}><span className="path-number">{item.status === 'done' ? '✓' : item.number}</span><div><strong>{item.title}</strong><small>{item.description}</small></div><span className={`path-state ${item.status === 'locked' ? 'locked' : ''}`}>{item.status === 'done' ? 'Complete' : item.status === 'current' ? 'In progress' : 'Locked'}</span></div>)}</div></div><div className="section-block check-in" id="streak"><div className="section-heading"><div><p className="eyebrow">ACCOUNTABILITY</p><h2>Check in</h2></div><span className="date-label">WEEK 02</span></div><p className="checkin-copy">You showed up <strong>4 times</strong> this week. Your consistency is becoming a skill.</p><div className="week-dots"><span className="visited">M</span><span className="visited">T</span><span className="visited">W</span><span className="today">T</span><span>F</span><span>S</span><span>S</span></div><button className="reflection-button">Write a 2-minute reflection <span>→</span></button></div></section>
        <footer><span>Built for people who are done waiting to feel ready.</span><span><i className="footer-dot" />System status: on track</span></footer>
      </main>
    </div>
  )
}

export default App
