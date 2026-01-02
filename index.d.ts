declare module "*.jpg";
declare module "*.json";
declare module "*.mp3";
declare module "*.mp4";
declare module "*.ogg";
declare module "*.png";
declare module "*.svg";
declare module "*.ttf";
declare module "*.wav";

import { ThreeElements } from "@react-three/fiber";

declare global {
    namespace React {
        namespace JSX {
            interface IntrinsicElements extends ThreeElements {}
        }
    }
}
