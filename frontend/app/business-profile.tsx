import { Redirect, type Href } from 'expo-router';

export default function BusinessProfileRedirect() {
  return <Redirect href={'/business' as Href} />;
}
