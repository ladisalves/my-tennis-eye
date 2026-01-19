# Project: Tennis Eye - Phase 1 (Line Mapping & Perspective)

## Objective
Create a web-based utility to map a tennis court corner using a smartphone camera. The system must define an "In-Zone" and an "Out-Zone" (30cm) based on user-defined anchor points and real-world tennis court dimensions.

## Tech Stack
- **Frontend:** HTML5, CSS3, TypeScript
- **Canvas:** 2D Context for UI overlays
- **Math/CV:** OpenCV.js (via CDN)
- **Environment:** Mobile Browser (Chrome/Safari)

## Core Logic Requirements

### 1. Calibration Setup
- Initialize the rear camera at the highest supported resolution.
- Allow the user to tap 4 points on the screen to define the 'L' corner:
    1. **Vertex (P1):** Intersection of Baseline and Sideline.
    2. **Baseline Point (P2):** A point further down the baseline.
    3. **Sideline Point (P3):** A point further down the sideline.
    4. **Line Width Marker (P4):** A point on the opposite edge of the white line from P1.

### 2. Dimension Scaling
- **The "White Line" Rule:** A standard tennis line is 5.08cm (2 inches) wide.
- Calculate the pixel distance between **P1** and **P4**. 
- Use this ratio ($pixels / 5.08cm$) to determine how many pixels constitute the **30cm "Out" Zone**.

### 3. Perspective & Homography
- Use `cv.getPerspectiveTransform` to map the user's tapped points into a 2D "Bird's Eye" coordinate system.
- Define a **Singles Profile** and **Doubles Profile**:
    - Singles: Active line is the inner sideline.
    - Doubles: Active line is the outer sideline.

### 4. Zone Visualization
- Draw a semi-transparent **Green Polygon** (10cm inside the line).
- Draw a semi-transparent **Red Polygon** (30cm outside the line).
- The polygons must be warped using the Homography matrix so they "lay flat" on the court floor in the video feed.

## UX Requirements
- **Mobile First:** Buttons must be large and touch-friendly.
- **Visual Feedback:** Show a magnifying glass "loupe" when the user is touching the screen to allow for precise placement of anchor points.
- **Reset Function:** Ability to clear points and start over.

## Implementation Steps for Codex
1. Create a `MediaDevices.getUserMedia` stream handler.
2. Implement a `Canvas` overlay that scales to the video aspect ratio.
3. Write a `calculateZones()` function that takes the 4 input points and outputs 4 sets of polygon coordinates.
4. Integrate `opencv.js` to handle the `warpPerspective` calls for the UI overlays.
