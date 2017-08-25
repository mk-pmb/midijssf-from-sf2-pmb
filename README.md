
<!--#echo json="package.json" key="name" underline="=" -->
midijssf-from-sf2-pmb
=====================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Utilities for converting .sf2 wavetables to MIDI.js sound font format.
<!--/#echo -->

The space and lowercase "f" in "MIDI.js sound font(s)" is my attempt to
help you discern them from
[the brand name](https://en.wikipedia.org/wiki/SoundFont).


Usage
-----

See the `midijssf-timgm6mb-pmb` package for how to use this one.


How it works
------------

* For each selected instrument (including percussion) and each MIDI note:
  * Make a MIDI file playing that note on that instrument.
    * If things work out, this is done only once when the package is installed,
      by running the `input-files.gen-all.js` script.
  * Let `fluidsynth` convert the MIDI to some primary audio format,
    using the configured `.sf2` wavetable.
    * You can check the available formats with
      `fluidsynth --audio-file-type help`.
      If you want formats that aren't in the list, or want to configure
      details about compression and quality (probably yes),
      use a lossless format like `flac` (or as last resort, `wav`) for the
      primary audio data, and then convert it later on.
  * Combine the audio clips into a MIDI.js sound font.
  * Optionally convert the sound font to additional formats — this can mean
    the container format, the samples inside it, or both.




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
