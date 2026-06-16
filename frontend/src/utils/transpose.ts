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

export function transposeText(text: string, semitones: number, useFlats: boolean): string {
  return text
    .split('\n')
    .map(line =>
      line.split(/(\s+)/).map(token =>
        /^[A-G][#b]?/.test(token) ? transposeChord(token, semitones, useFlats) : token
      ).join('')
    )
    .join('\n');
}
