# Studio media

The hero plays a 141-frame WebP sequence extracted from hero.mp4, not a seeking MP4 element. This permits deterministic forward and backward scrolling. The desktop set is about 2.3 MB; the mobile set is about 1.3 MB. Both are included under public/frames/hero, with their manifest.

To regenerate after replacing the root hero.mp4, run node scripts/extract-studio-frames.mjs. This development utility needs the installed Chrome browser and the project development dependencies. Regular builds use the already-generated frames and do not need Chrome.

The original public/video/hero.mp4 is retained as source footage. GSAP and ScrollTrigger are local scripts in public/vendor/gsap. The three supplied Lottie animations are copied to public/animations and loaded with the Lottie light renderer only as needed. The source JSON files in the project root remain unchanged.

Build with npm.cmd run build and host dist. No launcher or runtime setup is required.
