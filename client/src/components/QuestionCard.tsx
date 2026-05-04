import { Question } from '../types';

interface Props {
  question: Question;
  timeLeft: number;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  selectedAnswer?: string | null;
}

export function QuestionCard({ question, timeLeft, onAnswer, disabled, selectedAnswer }: Props) {
  const urgentTime = timeLeft <= 5;

  return (
    <div className="question-card">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {question.mode === 'kid' ? '🧒 Kids Question' : '🧑 Adult Question'}
        </span>
        <span style={{
          fontSize: '18px', fontFamily: "'Press Start 2P', monospace",
          color: urgentTime ? '#ef4444' : '#e2e8f0',
          animation: urgentTime ? 'pulse 0.5s ease infinite' : undefined,
          minWidth: '36px', textAlign: 'right',
        }}>
          {timeLeft}
        </span>
      </div>

      {question.visual && (
        <div style={{
          fontSize: '30px', textAlign: 'center', margin: '10px 0',
          background: '#07101f', border: '3px solid #1e3050', padding: '10px',
          letterSpacing: '4px', lineHeight: 1.3,
          clipPath: 'polygon(5px 0,calc(100% - 5px) 0,100% 5px,100% calc(100% - 5px),calc(100% - 5px) 100%,5px 100%,0 calc(100% - 5px),0 5px)',
        }}>
          {question.visual}
        </div>
      )}

      <p style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9', marginBottom: '14px', lineHeight: 1.35 }}>
        {question.text}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {question.options.map((opt, i) => {
          const letters = ['A', 'B', 'C', 'D'];
          const isSelected = selectedAnswer === opt;
          return (
            <button
              key={opt}
              onClick={() => !disabled && onAnswer(opt)}
              disabled={disabled}
              className={`answer-btn${isSelected ? ' selected' : ''}`}
            >
              <span style={{
                width: '22px', height: '22px', flexShrink: 0,
                background: isSelected ? '#1d4ed8' : '#0f1e35',
                border: `2px solid ${isSelected ? '#60a5fa' : '#1e3a5f'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, fontFamily: "'Press Start 2P', monospace",
                color: isSelected ? '#93c5fd' : '#334155',
                clipPath: 'polygon(3px 0,calc(100% - 3px) 0,100% 3px,100% calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,0 calc(100% - 3px),0 3px)',
              }}>{letters[i]}</span>
              <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, textAlign: 'left', lineHeight: 1.25 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
