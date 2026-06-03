import { useState } from 'react';

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function getNoteIndex(note: string): number {
  const si = SHARPS.indexOf(note);
  if (si !== -1) return si;
  return FLATS.indexOf(note);
}

function transposeRoot(root: string, semitones: number, useFlats: boolean): string {
  const idx = getNoteIndex(root);
  if (idx === -1) return root;
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return useFlats ? FLATS[newIdx] : SHARPS[newIdx];
}

function transposeChord(chord: string, semitones: number, useFlats: boolean): string {
  if (semitones === 0) return chord;
  // 슬래시 코드 처리 (예: C/G)
  const slashMatch = chord.match(/^([^/]+)\/([A-G][#b]?.*)$/);
  if (slashMatch) {
    return transposeChord(slashMatch[1], semitones, useFlats)
      + '/'
      + transposeChord(slashMatch[2], semitones, useFlats);
  }
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  return transposeRoot(match[1], semitones, useFlats) + match[2];
}

function transposeText(text: string, semitones: number, useFlats: boolean): string {
  return text
    .split('\n')
    .map(line =>
      line.split(/(\s+)/).map(token =>
        /^[A-G][#b]?/.test(token) ? transposeChord(token, semitones, useFlats) : token
      ).join('')
    )
    .join('\n');
}

export default function ChordPage() {
  const [input, setInput] = useState('');
  const [semitones, setSemitones] = useState(0);
  const [useFlats, setUseFlats] = useState(true);

  const transposed = transposeText(input, semitones, useFlats);
  const keyLabel = semitones === 0 ? '원본' : `${semitones > 0 ? '+' : ''}${semitones}키`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">코드 전조기</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-5">
        {/* 전조 컨트롤 */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSemitones(s => s - 1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold leading-none"
            >−</button>
            <span className="w-16 text-center font-semibold text-lg tabular-nums">{keyLabel}</span>
            <button
              onClick={() => setSemitones(s => s + 1)}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-xl font-bold leading-none"
            >+</button>
          </div>
          <button
            onClick={() => setSemitones(0)}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            초기화
          </button>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={useFlats}
              onChange={e => setUseFlats(e.target.checked)}
              className="rounded"
            />
            플랫(♭) 표기
          </label>
        </div>

        {/* 입력 */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">코드 입력</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={"예) A E Bm C#m\nF#m D A E"}
            rows={6}
            className="w-full border rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 결과 */}
        {input && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              전조 결과&nbsp;
              <span className="text-blue-600 font-semibold">{keyLabel}</span>
            </label>
            <pre className="w-full border rounded-md px-3 py-2 font-mono text-sm bg-gray-50 whitespace-pre-wrap min-h-[80px]">
              {transposed}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
