import {
    GreatVibes_400Regular,
    useFonts as useGreatVibes,
} from "@expo-google-fonts/great-vibes";
import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts as useInter,
} from "@expo-google-fonts/inter";
import {
    PlayfairDisplay_700Bold,
    useFonts as usePlayfair,
} from "@expo-google-fonts/playfair-display";

export function useAppFonts() {
  const [interReady] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [playfairReady] = usePlayfair({ PlayfairDisplay_700Bold });
  const [greatVibesReady] = useGreatVibes({ GreatVibes_400Regular });

  return interReady && playfairReady && greatVibesReady;
}
