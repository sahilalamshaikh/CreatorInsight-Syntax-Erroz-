'use client';

import { useEffect, useState } from 'react';
import {
User,
Info,
Link,
BarChart3,
Instagram,
Youtube,
Twitter,
Linkedin,
Facebook
} from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import SectionLabel from '@/components/ui/SectionLabel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { authApi, socialApi, userApi } from '@/lib/api';

const NICHES = [
'Lifestyle & Wellness',
'Tech',
'Gaming',
'Finance',
'Fashion',
'Food',
'Education',
'Fitness',
'Travel',
'Parenting',
'Business',
];

const PLATFORM_ICONS: any = {
instagram: Instagram,
youtube: Youtube,
twitter: Twitter,
linkedin: Linkedin,
facebook: Facebook,
};

const PLAT_COLORS: any = {
instagram: '#E1306C',
youtube: '#FF0000',
twitter: '#1DA1F2',
linkedin: '#0A66C2',
facebook: '#1877F2',
};

const TABS = [
{ name: 'Overview', icon: BarChart3 },
{ name: 'About', icon: Info },
{ name: 'Handles', icon: Link },
{ name: 'Insights', icon: User },
];

export default function ProfilePage() {

const [user, setUser] = useState<any>(null);
const [accounts, setAccounts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const [saving, setSaving] = useState(false);
const [saved, setSaved] = useState(false);

const [activeTab, setActiveTab] = useState('Overview');

const [form, setForm] = useState({
full_name: '',
username: '',
niche: '',
bio: '',
});

useEffect(() => {
loadData();
}, []);

async function loadData() {

try {

const [userRes, accRes] = await Promise.all([
authApi.me(),
socialApi.accounts()
]);

setUser(userRes.data);
setAccounts(accRes.data);

setForm({
full_name: userRes.data.full_name || '',
username: userRes.data.username || '',
niche: userRes.data.niche || '',
bio: userRes.data.bio || '',
});

} catch (err) {
console.error(err);
}

setLoading(false);
}

async function handleSave(e: React.FormEvent) {

e.preventDefault();
setSaving(true);

try {

await userApi.update(form);

setSaved(true);
setTimeout(() => setSaved(false), 2500);

} catch (err) {
console.error(err);
}

setSaving(false);
}

function update(field: string, value: string) {
setForm(prev => ({ ...prev, [field]: value }));
}

const initials = form.full_name
? form.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
: 'US';

const totalFollowers = accounts.reduce(
(sum, acc) => sum + (acc.follower_count || 0),
0
);

return (

<AppShell>

<div className="p-6 bg-gray-50 min-h-screen">

{loading ? (

<div className="flex justify-center items-center h-48">
<LoadingSpinner size={28} />
</div>

) : (

<div className="grid grid-cols-[280px_1fr] gap-6">

{/* SIDEBAR */}

<div className="bg-white border rounded-xl p-6">

<div className="flex flex-col items-center text-center">

<div className="w-24 h-24 rounded-full bg-purple-100 text-purple-700 text-3xl font-semibold flex items-center justify-center mb-3">
{initials}
</div>

<div className="text-lg font-semibold">
{form.full_name}
</div>

<div className="text-sm text-gray-500">
@{form.username}
</div>

<div className="text-xs text-gray-400 mb-4">
{user?.email}
</div>

<button
className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90"
style={{ background: '#534AB7' }}
>
Associate
</button>

</div>

<div className="mt-6 border-t pt-4">

<div className="flex justify-between text-sm">
<span className="text-gray-500">Followers</span>
<span className="font-semibold">
{totalFollowers >= 1000
? (totalFollowers / 1000).toFixed(1) + 'K'
: totalFollowers}
</span>
</div>

<div className="flex justify-between text-sm mt-2">
<span className="text-gray-500">Niche</span>
<span className="font-medium">
{form.niche || 'Not set'}
</span>
</div>

</div>

</div>

{/* CONTENT */}

<div>

{/* Tabs */}

<div className="flex gap-6 border-b mb-6">

{TABS.map(tab => {

const Icon = tab.icon;

return (

<button
key={tab.name}
onClick={() => setActiveTab(tab.name)}
className={`flex items-center gap-2 pb-3 text-sm font-medium transition ${
activeTab === tab.name
? 'border-b-2 border-purple-600 text-purple-600'
: 'text-gray-400 hover:text-gray-600'
}`}
>

<Icon size={16} />

{tab.name}

</button>

);

})}

</div>

{/* OVERVIEW */}

{activeTab === 'Overview' && (

<div className="space-y-5">

<div className="grid grid-cols-3 gap-4">

<Card>

<SectionLabel>Engagement Rate</SectionLabel>

<div className="text-xl font-semibold">
5.62%
</div>

</Card>

<Card>

<SectionLabel>Clicks</SectionLabel>

<div className="text-xl font-semibold">
1.5M
</div>

</Card>

<Card>

<SectionLabel>Transactions</SectionLabel>

<div className="text-xl font-semibold">
₹9,80,000
</div>

</Card>

</div>

<Card>

<SectionLabel>Connected Handles</SectionLabel>

{accounts.length === 0 ? (

<div className="text-center py-6 text-sm text-gray-400">
No connected accounts
</div>

) : (

<div className="grid grid-cols-2 gap-4">

{accounts.map(acc => {

const Icon = PLATFORM_ICONS[acc.platform];

return (

<div
key={acc.id}
className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition"
>

<div
className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
style={{ background: PLAT_COLORS[acc.platform] }}
>

{Icon && <Icon size={18} />}

</div>

<div>

<div className="text-sm font-semibold capitalize">
{acc.platform}
</div>

<div className="text-xs text-gray-400">
@{acc.platform_username}
</div>

</div>

</div>

);

})}

</div>

)}

</Card>

</div>

)}

{/* ABOUT */}

{activeTab === 'About' && (

<Card>

<SectionLabel>Edit Profile</SectionLabel>

<form onSubmit={handleSave} className="space-y-4">

<div className="grid grid-cols-2 gap-4">

<input
value={form.full_name}
onChange={e => update('full_name', e.target.value)}
placeholder="Full name"
className="border rounded-lg px-3 py-2 text-sm"
/>

<input
value={form.username}
onChange={e => update('username', e.target.value)}
placeholder="Username"
className="border rounded-lg px-3 py-2 text-sm"
/>

</div>

<select
value={form.niche}
onChange={e => update('niche', e.target.value)}
className="border rounded-lg px-3 py-2 text-sm w-full"
>

<option value="">Select niche</option>

{NICHES.map(n => (
<option key={n}>{n}</option>
))}

</select>

<textarea
value={form.bio}
onChange={e => update('bio', e.target.value)}
rows={3}
placeholder="Bio"
className="border rounded-lg px-3 py-2 text-sm w-full"
/>

<button
type="submit"
className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm"
>
{saving ? 'Saving...' : 'Save changes'}
</button>

{saved && (
<div className="text-sm text-emerald-600">
Profile updated successfully
</div>
)}

</form>

</Card>

)}

{/* HANDLES */}

{activeTab === 'Handles' && (

<Card>

<SectionLabel>All Social Handles</SectionLabel>

<div className="space-y-3">

{accounts.map(acc => {

const Icon = PLATFORM_ICONS[acc.platform];

return (

<div
key={acc.id}
className="flex items-center justify-between border rounded-lg p-4"
>

<div className="flex items-center gap-3">

<div
className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
style={{ background: PLAT_COLORS[acc.platform] }}
>

{Icon && <Icon size={18} />}

</div>

<div>

<div className="font-semibold capitalize">
{acc.platform}
</div>

<div className="text-xs text-gray-400">
@{acc.platform_username}
</div>

</div>

</div>

<div className="text-sm font-semibold">

{acc.follower_count >= 1000
? (acc.follower_count / 1000).toFixed(1) + 'K'
: acc.follower_count}

</div>

</div>

);

})}

</div>

</Card>

)}

{/* INSIGHTS */}

{activeTab === 'Insights' && (

<div className="grid grid-cols-3 gap-4">

<Card>

<SectionLabel>Total Followers</SectionLabel>

<div className="text-xl font-semibold">
{totalFollowers}
</div>

</Card>

<Card>

<SectionLabel>Platforms Connected</SectionLabel>

<div className="text-xl font-semibold">
{accounts.length}
</div>

</Card>

<Card>

<SectionLabel>Estimated Reach</SectionLabel>

<div className="text-xl font-semibold">
{(totalFollowers * 3).toLocaleString()}
</div>

</Card>

</div>

)}

</div>

</div>

)}

</div>

</AppShell>

);

}