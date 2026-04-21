import { Redirect, type Href } from 'expo-router';

export default function BusinessInfoRedirect() {
  return <Redirect href={'/business/info' as Href} />;
}
