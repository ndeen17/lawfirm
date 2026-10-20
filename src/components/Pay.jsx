import { useState } from 'react';
import { Modal } from './ui';
import { naira } from '../lib/format';

export const METHODS = ['Card', 'Bank transfer', 'USSD'];

// Holds payment form state + validation so booking and invoice payment share one form.
export function usePay() {
  const [method, setMethod] = useState('Card');
  const [card, setCard] = useState({ name: '', number: '4242 4242 4242 4242', exp: '12/28', cvc: '123' });
  const [error, setError] = useState('');
  const validate = () => {
    if (method !== 'Card') return true;
    const digits = card.number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(digits)) return setError('Enter a valid card number.'), false;
    if (!/^\d{2}\s*\/\s*\d{2}$/.test(card.exp)) return setError('Enter the expiry as MM/YY.'), false;
    if (!/^\d{3,4}$/.test(card.cvc)) return setError('Enter the 3-digit security code.'), false;
    setError('');
    return true;
  };
  return { method, setMethod, card, setCard, error, validate };
}

export function PayForm({ pay, amount, hideLabel }) {
  const { method, setMethod, card, setCard, error } = pay;
  const set = (k) => (e) => setCard({ ...card, [k]: e.target.value });
  return (
    <div className="payform">
      {!hideLabel && <span className="label-md">Pay consultation fee · {naira(amount)}</span>}
      <div className="pay-methods" role="tablist">
        {METHODS.map((m) => (
          <button key={m} type="button" role="tab" aria-selected={method === m} className={`pay-m${method === m ? ' pay-m-sel' : ''}`} onClick={() => setMethod(m)}>
            {m}
          </button>
        ))}
      </div>
      {method === 'Card' && (
        <div className="pay-card">
          <div className="field">
            <label htmlFor="cn">Card number</label>
            <input id="cn" inputMode="numeric" value={card.number} onChange={set('number')} autoComplete="off" />
          </div>
          <div className="pay-row">
            <div className="field">
              <label htmlFor="ce">Expiry</label>
              <input id="ce" value={card.exp} onChange={set('exp')} placeholder="MM/YY" autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="cc">CVC</label>
              <input id="cc" inputMode="numeric" value={card.cvc} onChange={set('cvc')} autoComplete="off" />
            </div>
          </div>
          {error && <span className="field-error">{error}</span>}
          <span className="muted-sm">Demo mode: a test card is pre-filled. No real payment is taken.</span>
        </div>
      )}
      {method === 'Bank transfer' && (
        <div className="pay-info">
          <div><span>Bank</span><strong>Harbor Trust Bank</strong></div>
          <div><span>Account name</span><strong>John &amp; Doe Legal</strong></div>
          <div><span>Account number</span><strong>0123456789</strong></div>
          <div><span>Amount</span><strong>{naira(amount)}</strong></div>
          <span className="muted-sm">Demo mode: confirm below to simulate receiving your transfer.</span>
        </div>
      )}
      {method === 'USSD' && (
        <div className="pay-info">
          <div><span>Dial</span><strong>*737*000*{Math.round(amount)}#</strong></div>
          <span className="muted-sm">Demo mode: confirm below to simulate a completed USSD payment.</span>
        </div>
      )}
    </div>
  );
}

export function Processing({ label = 'Processing payment…' }) {
  return (
    <div className="processing" role="status">
      <div className="processing-card">
        <span className="spinner" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function PaymentModal({ title = 'Pay invoice', amount, onClose, onPaid, description }) {
  const pay = usePay();
  const [busy, setBusy] = useState(false);
  const go = () => {
    if (!pay.validate()) return;
    setBusy(true);
    setTimeout(() => onPaid(pay.method), 1500);
  };
  return (
    <Modal
      title={title}
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-accent" onClick={go} disabled={busy}>Pay {naira(amount)}</button>
        </>
      }
    >
      {description && <p className="modal-lead">{description}</p>}
      <PayForm pay={pay} amount={amount} hideLabel />
      {busy && <Processing />}
    </Modal>
  );
}
