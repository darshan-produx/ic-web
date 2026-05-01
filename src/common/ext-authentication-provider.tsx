import { useQuery } from '@tanstack/react-query';
import OtpLogin from './OtpLogin';
import LicenseInvalid from './license-invalid';
import NoAccess from './no-access';
import InvalidStatus from './invalid-status';
import { useMyRoles } from '../services/queries/rolesQueries';

export function ExtAuthenticationProvider({
  children,
}: React.PropsWithChildren) {
  const rolesResult = useMyRoles();

  if (rolesResult.isLoading) {
    return;
  }

  if (rolesResult.isError) {
    return rolesResult.error.message;
  }

  if (rolesResult.data?.data.user_status === 'NOT_LOGGED_IN') {
    return <OtpLogin />;
  }

  if (rolesResult.data?.data.user_status === 'LICENSE_INVALID') {
    return <LicenseInvalid />;
  }

  if (
    rolesResult.data?.data.user_status === 'NOT_ACTIVE_USER_UNAPPROVED_DOMAIN'
  ) {
    return <NoAccess />;
  }

  if (
    rolesResult.data?.data.user_status === 'NOT_ACTIVE_USER' ||
    rolesResult.data?.data.user_status === 'ACTIVE_USER'
  ) {
    return children;
  }

  return <InvalidStatus />;
}
