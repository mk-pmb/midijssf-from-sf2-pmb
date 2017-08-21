
How to "install" Ubuntu/Debian soundfont packages in Windows
------------------------------------------------------------

* Find the name of the debian package that contains the `.sf2` file you want.
* Find that package in the
  [list of stable debian packages](https://packages.debian.org/stable/sound/).
* Click the package name headline to open the package details page.
* The sidebar on the right should have a section "Download Source Package"
  with some few links to files, at least one of them with a name that ends
  in `.dsc`. Follow the top-most `.dsc` link.
* You should now see a text file with `-----BEGIN PGP SIGNED MESSAGE-----`
  on the top. A few lines below, there should be a `Version:` line.
  Memorize or copy that version number.
* In your browser's address bar, delete the filename from the URL,
  i.e. everything after the last slash (`/`).
  Then request the new URL (in most browsers: press Enter).
* You should now see a list of files. There may be some with very similar
  names. You need one whose name starts with the exact package name,
  an underscore (`_`), the version number, another underscore (`_`),
  and ends with `.deb`. Download that file.
* After download, open the `.deb` file with
  [7-zip](https://en.wikipedia.org/wiki/7-Zip).
* Inside it, find the `.sf2` file (usually somewhere deep in the `usr`
  directory) and extract it.
* If you want to read the license, in the `.deb` there should be a text
  file at `usr/share/doc/PACKAGE_NAME_HERE/copyright`.
  Extract it, add `.txt` to its name and windows text editor should be
  able to display it.
  The text file may describe different licenses for different files in the
  `.deb` archive, so make sure you read the one for the actual soundfont file.


