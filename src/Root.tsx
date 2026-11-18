import { Composition } from "remotion";
import { Episode1 } from "./scenes/Episode1";
import { EPISODE_FRAMES, FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Episode1"
      component={Episode1}
      durationInFrames={EPISODE_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
