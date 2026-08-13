import { FoundationRecord, SpecialistRecord } from '../types';

export interface ParsedMarkers {
  cleanText: string;
  hasMarkers: boolean;
  foundationRecord: FoundationRecord | null;
  specialistRecord: SpecialistRecord | null;
}

export function parseResponseMarkers(fullText: string): ParsedMarkers {
  const fTagStart = '<FOUNDATION_RECORD>';
  const fTagEnd = '</FOUNDATION_RECORD>';
  const sTagStart = '<SPECIALIST_RECORD>';
  const sTagEnd = '</SPECIALIST_RECORD>';

  const fStartIndex = fullText.indexOf(fTagStart);
  const sStartIndex = fullText.indexOf(sTagStart);

  if (fStartIndex !== -1 && sStartIndex !== -1) {
    const firstMarkerPos = Math.min(fStartIndex, sStartIndex);
    const cleanText = fullText.substring(0, firstMarkerPos).trim();

    let foundationRecord: FoundationRecord | null = null;
    const fContentStart = fStartIndex + fTagStart.length;
    const fEndIndex = fullText.indexOf(fTagEnd, fContentStart);
    if (fEndIndex !== -1) {
      const fJsonStr = fullText.substring(fContentStart, fEndIndex).trim();
      try {
        foundationRecord = JSON.parse(fJsonStr);
      } catch (e) {
        console.warn('Error parsing FOUNDATION_RECORD JSON:', e);
      }
    }

    let specialistRecord: SpecialistRecord | null = null;
    const sContentStart = sStartIndex + sTagStart.length;
    const sEndIndex = fullText.indexOf(sTagEnd, sContentStart);
    if (sEndIndex !== -1) {
      const sJsonStr = fullText.substring(sContentStart, sEndIndex).trim();
      try {
        specialistRecord = JSON.parse(sJsonStr);
      } catch (e) {
        console.warn('Error parsing SPECIALIST_RECORD JSON:', e);
      }
    }

    return {
      cleanText,
      hasMarkers: foundationRecord !== null && specialistRecord !== null,
      foundationRecord,
      specialistRecord,
    };
  }

  // Handle case where tag starts but hasn't completed or no tag
  if (fStartIndex !== -1 || sStartIndex !== -1) {
    const minStart = fStartIndex !== -1 && sStartIndex !== -1
      ? Math.min(fStartIndex, sStartIndex)
      : (fStartIndex !== -1 ? fStartIndex : sStartIndex);
    return {
      cleanText: fullText.substring(0, minStart).trim(),
      hasMarkers: false,
      foundationRecord: null,
      specialistRecord: null,
    };
  }

  return {
    cleanText: fullText,
    hasMarkers: false,
    foundationRecord: null,
    specialistRecord: null,
  };
}
