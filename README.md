
<!--#echo json="package.json" key="name" underline="=" -->
midijssf-from-sf2-pmb
=====================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Utilities for converting .sf2 wavetables to MIDI.js sound font format.
<!--/#echo -->

The space and lowercase "f" in "sound font(s)" is my attempt to help you
discern them from [the brand name](https://en.wikipedia.org/wiki/SoundFont).


Usage
-----

See the `midijssf-timgm6mb-pmb` package for how to use this one.

Some hints:

* Beware that mono music usually won't survive the naive karaoke approach
  (`sox`: `oops` effect). If you try to save bytes this way, really compare
  the cost for each selected output format. Occasionally I have been surprised
  by how small a difference it made.


How it works
------------

* For each selected instrument (including percussion) and each MIDI note:
  * Make a MIDI file playing that note on that instrument.
    * If things work out, this is done only once when the package is installed,
      by running the `input-files.gen-all.js` script.
  * Let `fluidsynth` convert the MIDI to FLAC audio, using the configured
    `.sf2` wavetable.
    * WAV or AU seemed more efficient but caused problems with the plumbing.
  * Let `sox` convert the FLAC to WAV, and optionally trim trailing silence
    in the process.
  * Encode the samples to selected output formats (e.g. Vorbis, MP3)
    and compile them into bundles
    (MIDI.js sound font and/or Compact JSON WaveTable).



Template variables
------------------

Some options support variable. Their notation is `\v` (U+000B line tabulation)
followed by a single letter:

* `d`: config.destDir
* `B`: config.sf2basename
* `b`: config.sf2basename.toLowerCase()
* `F`: current output audio format ID
  * `f`: same but in lowercase
* `i`: current instrument ID (`001`…`128`, or `-10` for percussion)
* `I`: current instrument name (or config.chn10Name for percussion)
  * `s`: same but in snake_case





<!--#toc stop="scan" -->



Known issues
------------

* needs more/better tests and docs




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
