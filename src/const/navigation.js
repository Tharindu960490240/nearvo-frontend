// Side menu + dashboard cards, one list per role (same idea as AFC's const/navigation.js).
// item: { icon, label, text, path, group?, home? }
//   - text: the short line shown on the dashboard card
//   - home: the dashboard itself (not shown as a card)
//   - group: small heading shown above the item in the side menu
import {
  LuBriefcaseBusiness, LuClipboardList, LuEye, LuFilePlus2, LuFlag, LuLayoutDashboard, LuSquarePen, LuUserRound, LuUserRoundSearch,
} from 'react-icons/lu';

const dashboard = { icon: LuLayoutDashboard, label: 'Dashboard', path: '/dashboard', home: true };
const account = { icon: LuUserRound, label: 'My account', text: 'Your name, phone number and email address.', path: '/account', group: 'Account' };

export const NAV_ITEMS = {
  customer: [
    dashboard,
    { icon: LuFilePlus2, label: 'Post a job', text: 'Describe the job and get free quotes from local tradies.', path: '/jobs/new', group: 'Jobs' },
    { icon: LuClipboardList, label: 'My jobs', text: 'Compare quotes, hire a tradie and leave reviews.', path: '/my-jobs' },
    { icon: LuUserRoundSearch, label: 'Find a tradie', text: 'Browse tradies who cover your suburb.', path: '/tradies' },
    account,
  ],
  tradie: [
    dashboard,
    { icon: LuBriefcaseBusiness, label: 'Find work', text: 'New jobs in your area, your quotes and jobs won.', path: '/tradie', group: 'Work' },
    { icon: LuSquarePen, label: 'My tradie profile', text: 'ABN, services, prices, service area and reviews.', path: '/tradie/profile' },
    { icon: LuEye, label: 'Public profile', text: 'See your profile the way customers see it.', path: '/tradies/:me' },
    account,
  ],
  admin: [
    dashboard,
    { icon: LuFlag, label: 'Reports', text: 'Reports and complaints to review.', path: '/admin', group: 'Manage' },
    { icon: LuUserRoundSearch, label: 'Tradies', text: 'Browse every listed tradie.', path: '/tradies' },
    account,
  ],
};

export const ROLE_LABELS = { customer: 'Customer', tradie: 'Tradie', admin: 'Admin' };

/** Menu items for a user, with personal paths filled in. */
export const navFor = (user) =>
  (NAV_ITEMS[user?.role] || []).map((i) => ({ ...i, path: i.path.replace(':me', String(user?.id)) }));
