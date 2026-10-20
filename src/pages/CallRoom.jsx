import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { areaById, lawyerById } from '../data/static';
import { initialsOf } from '../lib/format';
import { IconCam, IconMic, IconPhone } from '../components/ui';

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function CallRoom() {
  const { id } = useParams();
  const { db, user } = useStore();
  const nav = useNavigate();
  const [phase, setPhase] = useState('lobby'); // lobby | waiting | live | ended
  const [secs, setSecs] = useState(0);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  const appt = db.appointments.find((a) => a.id === id);
  const isClient = user?.role === 'client';
  const home = isClient ? '/portal' : '/staff';

  useEffect(() => {
    if (phase !== 'waiting') return;
    const t = setTimeout(() => setPhase('live'), 2600);
    return () => clearTimeout(t);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'live') return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  if (!user) return <Navigate to="/login" replace />;
  if (!appt) return <Navigate to={home} replace />;
  const lawyer = lawyerById(appt.lawyerId);
  const client = db.users.find((u) => u.id === appt.clientId);
  const other = isClient ? lawyer : client;
  const otherInitials = isClient ? lawyer.initials : initialsOf(client.name);
  const meInitials = initialsOf(user.name);

  return (
    <div className="call">
      <div className="call-top">
        <span>John &amp; Doe Legal · {areaById(appt.areaId).bookName}</span>
        <span className="call-secure">End-to-end encrypted (demo)</span>
      </div>

      {phase === 'lobby' && (
        <div className="call-lobby">
          <div className="call-preview"><span className="call-avatar">{meInitials}</span>{!cam && <em>Camera off</em>}</div>
          <div className="call-lobby-b">
            <h1>Ready to join?</h1>
            <p>Consultation with {other.name}. {isClient ? 'Your lawyer will let you in shortly.' : 'The client is waiting for you.'}</p>
            <div className="call-ctl">
              <button type="button" className={`call-btn${mic ? '' : ' off'}`} onClick={() => setMic(!mic)} aria-pressed={!mic}><IconMic size={20} /><span>{mic ? 'Mic on' : 'Mic off'}</span></button>
              <button type="button" className={`call-btn${cam ? '' : ' off'}`} onClick={() => setCam(!cam)} aria-pressed={!cam}><IconCam size={20} /><span>{cam ? 'Camera on' : 'Camera off'}</span></button>
            </div>
            <div className="call-actions">
              <button type="button" className="btn btn-accent" onClick={() => setPhase('waiting')}>Join now</button>
              <button type="button" className="btn btn-outline-light" onClick={() => nav(home)}>Back</button>
            </div>
          </div>
        </div>
      )}

      {(phase === 'waiting' || phase === 'live') && (
        <div className="call-stage">
          <div className="call-main">
            {phase === 'waiting' ? (
              <div className="call-wait"><span className="spinner spinner-light" /><span>Waiting for {other.name.split(' ')[0]} to join…</span></div>
            ) : (
              <>
                <span className="call-avatar call-avatar-xl">{otherInitials}</span>
                <span className="call-name">{other.name}</span>
              </>
            )}
            <div className="call-self"><span className="call-avatar">{meInitials}</span>{!cam && <em>Off</em>}</div>
            {phase === 'live' && <span className="call-timer">{mmss(secs)}</span>}
          </div>
          <div className="call-bar">
            <button type="button" className={`call-btn round${mic ? '' : ' off'}`} onClick={() => setMic(!mic)} aria-label="Toggle microphone"><IconMic size={20} /></button>
            <button type="button" className={`call-btn round${cam ? '' : ' off'}`} onClick={() => setCam(!cam)} aria-label="Toggle camera"><IconCam size={20} /></button>
            <button type="button" className="call-btn round end" onClick={() => setPhase('ended')} aria-label="Leave call"><IconPhone size={20} /></button>
          </div>
        </div>
      )}

      {phase === 'ended' && (
        <div className="call-lobby call-ended">
          <div className="call-lobby-b" style={{ textAlign: 'center', alignItems: 'center' }}>
            <h1>You left the call</h1>
            <p>{secs > 0 ? `Call length ${mmss(secs)}.` : 'The call has ended.'} {isClient ? 'A written summary of your options will follow in your portal.' : 'Remember to mark the consultation complete and open a matter if the client is instructing you.'}</p>
            <div className="call-actions">
              <button type="button" className="btn btn-accent" onClick={() => nav(home)}>{isClient ? 'Back to portal' : 'Back to workspace'}</button>
              <button type="button" className="btn btn-outline-light" onClick={() => { setPhase('lobby'); setSecs(0); }}>Rejoin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
