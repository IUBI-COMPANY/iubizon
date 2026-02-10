// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectType = { [field: string]: any };

type FormOnChange = (...event: unknown[]) => void;

type Translate = (
  key: string,
  params?: string[],
  defaultTranslation?: string,
) => string;

type OnNavigateTo<T = ObjectType> = (pathname: string, state?: T) => void;

type OnNavigateToExternalPage = (href: string) => void;

type OnGoBack = () => void;

type GaPageView = (pathname: string) => void;

type GaEvent = (eventArgs: GaEventArgs) => void;

interface GaEventArgs {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface DefaultFirestoreProps {
  createdAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
  updatedBy: string;
  isDeleted: boolean;
  createdBy?: string;
}
