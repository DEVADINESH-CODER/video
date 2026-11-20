import { Composition } from "remotion";
import type { EpisodeDefinition } from "./episode";

/**
 * Register every episode in the project, automatically.
 *
 * The bundler resolves this context at build time, so any folder matching
 * `episodes/ep<number>/index.ts` is picked up with no edit to this file:
 * create episodes/ep02/, export `episode`, and `Episode2` appears in the
 * studio and becomes renderable. Episode folders never import each other, and
 * each composition id is unique, so adding one can never overwrite a previous
 * episode's video (renders go to out/<slug>.mp4).
 */

type EpisodeModule = { episode?: EpisodeDefinition };

type EpisodeContext = {
  keys(): string[];
  (id: string): EpisodeModule;
};

// Resolved by the bundler at build time (webpack and Rspack both support it).
declare const require: {
  context(
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp,
  ): EpisodeContext;
};

const episodeContext = require.context(
  "../episodes",
  true,
  /^\.\/ep\d+\/index\.tsx?$/,
);

const discovered: EpisodeDefinition[] = episodeContext
  .keys()
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }))
  .map((key) => {
    const module = episodeContext(key) as EpisodeModule;
    if (!module.episode) {
      throw new Error(
        `${key} must export \`episode\`: { config, Component } — see episodes/ep01/index.ts.`,
      );
    }
    return module.episode;
  });

if (discovered.length === 0) {
  throw new Error(
    "No episodes found. Each episode needs an episodes/ep<number>/index.ts exporting { config, Component }.",
  );
}

const ids = new Set<string>();
for (const { config } of discovered) {
  if (ids.has(config.id)) {
    throw new Error(
      `Duplicate composition id "${config.id}" — every episode needs a unique config.id.`,
    );
  }
  ids.add(config.id);
}

export const RemotionRoot: React.FC = () => {
  /*
   * Episode1 is registered from episodes/ep01/config.ts as exactly:
   *
   *   <Composition
   *     id="Episode1"
   *     component={Episode1}
   *     durationInFrames={1740}
   *     fps={30}
   *     width={1080}
   *     height={1920}
   *   />
   *
   * The optional voice track is intentionally left silent until the file exists:
   *   <Audio src={staticFile("ep1_voice.wav")} />
   */
  return (
    <>
      {discovered.map(({ config, Component }) => (
        <Composition
          key={config.id}
          id={config.id}
          component={Component}
          durationInFrames={config.durationInFrames}
          fps={config.fps}
          width={config.width}
          height={config.height}
        />
      ))}
    </>
  );
};
