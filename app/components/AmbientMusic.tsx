'use client'

import { useEffect, useRef, useCallback } from 'react'

interface AmbientMusicProps {
  enabled: boolean
}

export default function AmbientMusic({ enabled }: AmbientMusicProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Peaceful pentatonic scale frequencies
  const notes = {
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  }
  const scale = Object.values(notes)

  const startMusic = useCallback(async () => {
    try {
      // Create audio context on user gesture
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      audioContextRef.current = ctx

      // Resume if suspended
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      // Master gain
      const masterGain = ctx.createGain()
      masterGain.gain.value = 0.15
      masterGain.connect(ctx.destination)
      gainNodeRef.current = masterGain

      // Create reverb effect using convolver
      const convolver = ctx.createConvolver()
      const reverbTime = 3
      const sampleRate = ctx.sampleRate
      const length = sampleRate * reverbTime
      const impulse = ctx.createBuffer(2, length, sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel)
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2)
        }
      }
      convolver.buffer = impulse

      // Wet/dry mix
      const dryGain = ctx.createGain()
      dryGain.gain.value = 0.4
      const wetGain = ctx.createGain()
      wetGain.gain.value = 0.6
      
      dryGain.connect(masterGain)
      convolver.connect(wetGain)
      wetGain.connect(masterGain)

      // Function to play a soft note
      const playNote = (freq: number, duration: number, delay: number = 0) => {
        const osc = ctx.createOscillator()
        const noteGain = ctx.createGain()
        
        osc.type = 'sine'
        osc.frequency.value = freq
        
        const now = ctx.currentTime + delay
        noteGain.gain.setValueAtTime(0, now)
        noteGain.gain.linearRampToValueAtTime(0.3, now + 0.5)
        noteGain.gain.exponentialRampToValueAtTime(0.01, now + duration)
        
        osc.connect(noteGain)
        noteGain.connect(dryGain)
        noteGain.connect(convolver)
        
        osc.start(now)
        osc.stop(now + duration + 0.1)
        
        oscillatorsRef.current.push(osc)
      }

      // Play a chord
      const playChord = () => {
        const baseIndex = Math.floor(Math.random() * 5)
        const root = scale[baseIndex]
        const third = scale[(baseIndex + 2) % scale.length]
        const fifth = scale[(baseIndex + 4) % scale.length]
        
        playNote(root, 6, 0)
        playNote(third, 5.5, 0.1)
        playNote(fifth, 5, 0.2)
      }

      // Play an arpeggio note
      const playArpeggio = () => {
        if (Math.random() > 0.4) {
          const note = scale[Math.floor(Math.random() * scale.length)]
          playNote(note, 2, 0)
        }
      }

      // Play initial chord
      playChord()

      // Schedule repeating patterns
      intervalRef.current = setInterval(() => {
        if (Math.random() > 0.7) {
          playChord()
        }
        playArpeggio()
      }, 2000)

    } catch (e) {
      console.error('Failed to start ambient music:', e)
    }
  }, [scale])

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    oscillatorsRef.current.forEach(osc => {
      try { osc.stop() } catch {}
    })
    oscillatorsRef.current = []

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startMusic()
    } else {
      stopMusic()
    }

    return () => {
      stopMusic()
    }
  }, [enabled, startMusic, stopMusic])

  return null
}
