'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'

interface AmbientMusicProps {
  enabled: boolean
}

export default function AmbientMusic({ enabled }: AmbientMusicProps) {
  const initialized = useRef(false)
  const synthPad = useRef<Tone.PolySynth | null>(null)
  const synthArp = useRef<Tone.PolySynth | null>(null)
  const synthBells = useRef<Tone.PolySynth | null>(null)
  const padLoop = useRef<Tone.Loop | null>(null)
  const arpLoop = useRef<Tone.Loop | null>(null)
  const bellLoop = useRef<Tone.Loop | null>(null)

  // Musical scales for ambient feel
  const scales = {
    peaceful: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'],
    dreamy: ['D4', 'F4', 'A4', 'C5', 'E5', 'G5', 'A5', 'D6'],
    wonder: ['E4', 'G4', 'B4', 'D5', 'F#5', 'A5', 'B5', 'E6'],
  }

  const initAudio = useCallback(async () => {
    if (initialized.current) return
    initialized.current = true

    await Tone.start()
    
    // Soft pad synth for background harmony
    synthPad.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.8,
        release: 3,
      },
    }).toDestination()
    synthPad.current.volume.value = -18

    // Gentle arpeggio synth
    synthArp.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.2,
        release: 1.5,
      },
    }).toDestination()
    synthArp.current.volume.value = -22

    // Bell/chime synth for sparkle
    synthBells.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.1,
        release: 2,
      },
    }).toDestination()
    synthBells.current.volume.value = -25

    // Add reverb for spaciousness
    const reverb = new Tone.Reverb({ decay: 4, wet: 0.6 }).toDestination()
    synthPad.current.connect(reverb)
    synthArp.current.connect(reverb)
    synthBells.current.connect(reverb)

    let currentScale = scales.peaceful
    let scaleIndex = 0

    // Pad loop - slow chord changes
    padLoop.current = new Tone.Loop((time) => {
      if (!synthPad.current) return
      const scaleKeys = Object.keys(scales) as (keyof typeof scales)[]
      currentScale = scales[scaleKeys[scaleIndex % scaleKeys.length]]
      
      // Play a soft chord
      const root = currentScale[0]
      const third = currentScale[2]
      const fifth = currentScale[4]
      
      synthPad.current.triggerAttackRelease([root, third, fifth], '4n', time)
      scaleIndex++
    }, '8m') // Every 8 measures

    // Arpeggio loop - gentle melodic movement
    let arpIndex = 0
    arpLoop.current = new Tone.Loop((time) => {
      if (!synthArp.current) return
      
      // Random chance to play a note
      if (Math.random() > 0.3) {
        const note = currentScale[arpIndex % currentScale.length]
        synthArp.current.triggerAttackRelease(note, '8n', time)
      }
      arpIndex++
    }, '2n') // Every half note

    // Bell loop - occasional sparkles
    bellLoop.current = new Tone.Loop((time) => {
      if (!synthBells.current) return
      
      // Random chance for bell chime
      if (Math.random() > 0.7) {
        const note = currentScale[Math.floor(Math.random() * currentScale.length)]
        // Play an octave higher for bell-like quality
        const highNote = note.replace(/\d/, (d) => String(parseInt(d) + 1))
        synthBells.current.triggerAttackRelease(highNote, '16n', time)
      }
    }, '1m') // Every measure

  }, [])

  useEffect(() => {
    if (enabled) {
      initAudio().then(() => {
        if (Tone.context.state === 'running' || Tone.context.state === 'suspended') {
          Tone.Transport.bpm.value = 60
          Tone.Transport.start()
          padLoop.current?.start(0)
          arpLoop.current?.start(0)
          bellLoop.current?.start(0)
        }
      }).catch(() => {
        // Silently fail if AudioContext not allowed
      })
    } else {
      // Only stop if we actually initialized
      if (initialized.current) {
        try {
          padLoop.current?.stop()
          arpLoop.current?.stop()
          bellLoop.current?.stop()
          Tone.Transport.stop()
        } catch {
          // Tone not ready yet, ignore
        }
      }
    }

    return () => {
      if (initialized.current) {
        try { Tone.Transport.stop() } catch { /* ignore */ }
      }
    }
  }, [enabled, initAudio])

  return null // This component only handles audio, no UI
}
