# CineCode

A beautiful, high-performance web wrapper around the original Movie BarCode Generator logic—running entirely in your browser using HTML5 `<canvas>` and native `<video>` parsing.

## What it does
CineCode extracts individual frames from a full-length movie at regular intervals, squashes them down into 1-pixel wide vertical slices, and stitches them together chronologically. The resulting image looks like a colorful barcode, giving you a beautiful visual timeline of the film's color palette from start to finish.

## Features
- **Zero Server Costs and No Windows Dependency:** Since it uses native browser tools, there is no massive file uploading needed. It works incredibly fast completely locally and is not limited to windows like the original.
- **Accurate MagicScaler Implementation:** Includes a 1:1 replica of the native C# "Smooth Bars" mode. It mathematically computes the true average color of a frame in real-time.


## Live Demo
Check it out here: **[https://apshampa.github.io/cinecode/](https://apshampa.github.io/cinecode/)**

## Credits
This web tool is heavily inspired by and based on the underlying logic of the amazing original desktop application built by Melvyn Laily. 

