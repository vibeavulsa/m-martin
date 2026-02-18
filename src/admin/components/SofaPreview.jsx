import React from 'react';

// Parse CSS gradient string to extract colors for SVG
const parseGradient = (gradientStr) => {
  if (!gradientStr) return ['#666', '#444'];
  const colorMatches = gradientStr.match(/#[0-9a-fA-F]{3,6}/g);
  if (colorMatches && colorMatches.length >= 2) {
    return [colorMatches[0], colorMatches[1]];
  }
  return ['#666', '#444'];
};

const styles = {
  container: {
    background: '#191210',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2a1f16',
  },
  title: {
    color: '#d9b154',
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '16px',
    textAlign: 'center',
  },
  svgWrapper: {
    width: '100%',
  },
  labels: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '16px',
    padding: '0 40px',
  },
  label: {
    textAlign: 'center',
    minWidth: '60px',
  },
  labelNumber: {
    color: '#d9b154',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  labelColor: {
    color: '#e8e1d4',
    fontSize: '0.75rem',
    marginTop: '2px',
  },
  labelEmpty: {
    color: '#bfb3a2',
    fontSize: '0.75rem',
    fontStyle: 'italic',
    marginTop: '2px',
  },
};

const SofaPreview = ({ cushionColors = [], colorGradients = {} }) => {
  const cushions = Array.from({ length: 5 }, (_, i) => cushionColors[i] || null);

  const cushionWidth = 72;
  const cushionHeight = 60;
  const cushionGap = 12;
  const totalCushionsWidth = cushionWidth * 5 + cushionGap * 4;
  const sofaPadding = 30;
  const sofaWidth = totalCushionsWidth + sofaPadding * 2;
  const svgWidth = sofaWidth + 40;
  const startX = (svgWidth - totalCushionsWidth) / 2;

  return (
    <div style={styles.container}>
      <div style={styles.title}>Visualização do Sofá</div>
      <div style={styles.svgWrapper}>
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} 200`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {cushions.map((colorName, i) => {
              if (!colorName) return null;
              const gradientStr = colorGradients[colorName];
              const [color1, color2] = parseGradient(gradientStr);
              return (
                <linearGradient
                  key={`cushion-grad-${i}`}
                  id={`cushion-grad-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={color1} />
                  <stop offset="100%" stopColor={color2} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Sofa back */}
          <rect
            x={20}
            y={20}
            width={sofaWidth}
            height={90}
            rx={16}
            ry={16}
            fill="#1e150e"
            stroke="#2a1f16"
            strokeWidth={1.5}
          />

          {/* Sofa seat base */}
          <rect
            x={20}
            y={85}
            width={sofaWidth}
            height={70}
            rx={12}
            ry={12}
            fill="#231a12"
            stroke="#2a1f16"
            strokeWidth={1.5}
          />

          {/* Left arm */}
          <rect
            x={12}
            y={30}
            width={22}
            height={120}
            rx={10}
            ry={10}
            fill="#1e150e"
            stroke="#2a1f16"
            strokeWidth={1.5}
          />

          {/* Right arm */}
          <rect
            x={sofaWidth + 6}
            y={30}
            width={22}
            height={120}
            rx={10}
            ry={10}
            fill="#1e150e"
            stroke="#2a1f16"
            strokeWidth={1.5}
          />

          {/* Cushions */}
          {cushions.map((colorName, i) => {
            const cx = startX + i * (cushionWidth + cushionGap);
            const cy = 90;
            const hasColor = !!colorName;

            return (
              <g key={i}>
                {hasColor ? (
                  <rect
                    x={cx}
                    y={cy}
                    width={cushionWidth}
                    height={cushionHeight}
                    rx={10}
                    ry={10}
                    fill={`url(#cushion-grad-${i})`}
                    stroke="#d9b154"
                    strokeWidth={1}
                    opacity={0.95}
                  />
                ) : (
                  <>
                    <rect
                      x={cx}
                      y={cy}
                      width={cushionWidth}
                      height={cushionHeight}
                      rx={10}
                      ry={10}
                      fill="none"
                      stroke="#bfb3a2"
                      strokeWidth={1}
                      strokeDasharray="6 3"
                      opacity={0.5}
                    />
                    <text
                      x={cx + cushionWidth / 2}
                      y={cy + cushionHeight / 2 + 5}
                      textAnchor="middle"
                      fill="#bfb3a2"
                      fontSize="18"
                      opacity={0.6}
                    >
                      ?
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Legs */}
          <rect x={40} y={155} width={14} height={16} rx={3} fill="#1e150e" stroke="#2a1f16" strokeWidth={1} />
          <rect x={sofaWidth - 14} y={155} width={14} height={16} rx={3} fill="#1e150e" stroke="#2a1f16" strokeWidth={1} />
        </svg>
      </div>

      {/* Cushion labels */}
      <div style={styles.labels}>
        {cushions.map((colorName, i) => (
          <div key={i} style={styles.label}>
            <div style={styles.labelNumber}>{i + 1}</div>
            {colorName ? (
              <div style={styles.labelColor}>{colorName}</div>
            ) : (
              <div style={styles.labelEmpty}>vazio</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SofaPreview;
