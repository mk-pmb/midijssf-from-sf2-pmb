#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
grep -m 1 base64 -- "${1:-cat-midijs/acoustic_grand_piano.js}" \
  | cut -d , -f 2- | base64 --decode --ignore-garbage
