import { useQuery } from '@tanstack/react-query';
import { getUserTeam } from '../../app/api/users/users';

export function useMyTeam() {
  return useQuery({
    queryKey: ['get-User-Team'],
    queryFn: () => getUserTeam(),
    refetchOnWindowFocus: false,
  });
}
