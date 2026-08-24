import React from 'react';
import type { Agent, ArgumentClaim, ClaimStatus } from '../../types/debate';

interface ClaimGraphProps {
  claims: ArgumentClaim[];
  agents: Agent[];
  isLight: boolean;
}

const COL_WIDTH = 216;
const ROW_HEIGHT = 96;
const NODE_WIDTH = 190;
const NODE_HEIGHT = 66;
const PADDING = 28;

const STATUS_COLOR: Record<ClaimStatus, { light: string; dark: string }> = {
  proposed: { light: '#94a3b8', dark: '#64748b' },
  supported: { light: '#059669', dark: '#34d399' },
  strengthened: { light: '#4f46e5', dark: '#818cf8' },
  contested: { light: '#e11d48', dark: '#fb7185' },
  weakened: { light: '#b45309', dark: '#f0b64c' },
  conceded: { light: '#b45309', dark: '#f0b64c' },
  unresolved: { light: '#94a3b8', dark: '#64748b' },
};

const STATUS_LABEL: Record<ClaimStatus, string> = {
  proposed: '제안됨',
  supported: '뒷받침됨',
  strengthened: '강화됨',
  contested: '반박받음',
  weakened: '약화됨',
  conceded: '인정됨',
  unresolved: '미해결',
};

export const ClaimGraph: React.FC<ClaimGraphProps> = ({ claims, agents, isLight }) => {
  if (claims.length === 0) {
    return <p className="text-slate-400 italic">시각화할 주장 관계가 없습니다.</p>;
  }

  // One column per agent (in settings order); claims are appended
  // chronologically as the debate runs, so within a column, array order
  // doubles as turn order.
  const columnOfAgent = new Map(agents.map((a, idx) => [a.id, idx]));
  const rowByAgent = new Map<string, number>();
  const positions = new Map<string, { x: number; y: number; col: number; row: number }>();

  claims.forEach((claim) => {
    const col = columnOfAgent.get(claim.speakerId) ?? agents.length;
    const row = rowByAgent.get(claim.speakerId) ?? 0;
    rowByAgent.set(claim.speakerId, row + 1);
    positions.set(claim.claimId, {
      col,
      row,
      x: PADDING + col * COL_WIDTH,
      y: PADDING + 34 + row * ROW_HEIGHT,
    });
  });

  const colCount = Math.max(agents.length, 1);
  const maxRow = Math.max(0, ...Array.from(rowByAgent.values()));
  const svgWidth = PADDING * 2 + colCount * COL_WIDTH;
  const svgHeight = PADDING * 2 + 34 + Math.max(1, maxRow) * ROW_HEIGHT;

  const edges: { fromId: string; toId: string }[] = [];
  claims.forEach((claim) => {
    claim.attackedBy.forEach((attackerId) => {
      if (positions.has(attackerId)) edges.push({ fromId: attackerId, toId: claim.claimId });
    });
  });

  const textColor = isLight ? '#1e293b' : '#e2e8f0';
  const subColor = isLight ? '#64748b' : '#94a3b8';
  const nodeFill = isLight ? '#ffffff' : '#0f172a';
  const headerColor = isLight ? '#334155' : '#cbd5e1';
  const edgeColor = isLight ? '#e11d48' : '#fb7185';

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[420px] custom-scrollbar rounded-xl border p-1"
      style={{ borderColor: isLight ? '#e2e8f0' : '#1f2937' }}
    >
      <svg width={svgWidth} height={svgHeight} role="img" aria-label="주장 관계도">
        <defs>
          <marker id="claimArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={edgeColor} />
          </marker>
        </defs>

        {agents.map((agent, idx) => (
          <text
            key={agent.id}
            x={PADDING + idx * COL_WIDTH + NODE_WIDTH / 2}
            y={PADDING + 12}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={headerColor}
          >
            {agent.name}
          </text>
        ))}

        {edges.map(({ fromId, toId }, idx) => {
          const from = positions.get(fromId)!;
          const to = positions.get(toId)!;
          const x1 = from.x + NODE_WIDTH / 2;
          const y1 = from.y + NODE_HEIGHT;
          const x2 = to.x + NODE_WIDTH / 2;
          const y2 = to.y;
          const midY = (y1 + y2) / 2;
          return (
            <path
              key={idx}
              d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
              fill="none"
              stroke={edgeColor}
              strokeWidth={1.5}
              strokeOpacity={0.75}
              markerEnd="url(#claimArrow)"
            />
          );
        })}

        {claims.map((claim) => {
          const pos = positions.get(claim.claimId);
          if (!pos) return null;
          const statusColor = STATUS_COLOR[claim.status][isLight ? 'light' : 'dark'];
          const agentColor = agents.find((a) => a.id === claim.speakerId)?.avatarColor || statusColor;
          return (
            <g key={claim.claimId} transform={`translate(${pos.x}, ${pos.y})`}>
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={10}
                fill={nodeFill}
                stroke={statusColor}
                strokeWidth={1.5}
              />
              <rect x={0} y={0} width={4} height={NODE_HEIGHT} rx={2} fill={agentColor} />
              <foreignObject x={10} y={5} width={NODE_WIDTH - 18} height={NODE_HEIGHT - 20}>
                <div
                  style={{
                    fontSize: '11.5px',
                    lineHeight: 1.35,
                    color: textColor,
                    fontFamily: 'inherit',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {claim.claimText}
                </div>
              </foreignObject>
              <text x={10} y={NODE_HEIGHT - 7} fontSize={10.5} fontWeight={600} fill={statusColor}>
                {STATUS_LABEL[claim.status]}
              </text>
              <text x={NODE_WIDTH - 10} y={NODE_HEIGHT - 7} fontSize={10} fill={subColor} textAnchor="end">
                {claim.claimId.length > 14 ? `${claim.claimId.slice(0, 14)}…` : claim.claimId}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
