import { Platform } from 'react-native';

import ExploreNative from './explore.native';
import ExploreWeb from './explore.web';

export default Platform.OS === 'web' ? ExploreWeb : ExploreNative;
