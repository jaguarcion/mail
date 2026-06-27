"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Copy, Link as LinkIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClientsTab({ token, clients, onFetchClients }) {
    const [form, setForm] = useState({ email: '', telegram: '', subscription_ends_at: '' });
    const [loading, setLoading] = useState(false);
    const [availableAccounts, setAvailableAccounts] = useState([]);

    const fetchAvailableAccounts = async () => {
        try {
            const res = await fetch("/api/adobe", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                // Filter accounts that are active and not currently assigned to a real client
                setAvailableAccounts(data.data.filter(acc => acc.status === 'active' && (!acc.assigned_client_id || acc.assigned_client_id === -1)));
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchAvailableAccounts();
    }, [token, clients]); // Refetch when clients change so the list is updated

    const handleAssignAdobe = async (clientId, adobeId) => {
        try {
            const res = await fetch(`/api/adobe`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ id: adobeId, client_id: clientId, action: "assign" })
            });
            if (res.ok) {
                toast.success("Аккаунт успешно привязан");
                onFetchClients();
                fetchAvailableAccounts();
            } else {
                toast.error("Ошибка при привязке");
            }
        } catch (e) {
            toast.error("Ошибка сети");
        }
    };

    const copyBotLink = (botToken) => {
        const link = `https://t.me/zenmailflow_bot?start=${botToken}`;
        navigator.clipboard.writeText(link);
        toast.success("Ссылка на бота скопирована!");
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Клиент успешно создан!");
                setForm({ email: '', telegram: '', subscription_ends_at: '' });
                onFetchClients();
            } else {
                toast.error(data.error || "Ошибка при создании");
            }
        } catch (e) {
            toast.error(e.message || "Произошла ошибка");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Создание клиента</CardTitle>
                    <CardDescription>Добавление нового профиля клиента</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="client@test.com" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Telegram</label>
                            <Input type="text" value={form.telegram} onChange={e => setForm({...form, telegram: e.target.value})} placeholder="@username" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Подписка до</label>
                            <Input type="date" value={form.subscription_ends_at} onChange={e => setForm({...form, subscription_ends_at: e.target.value})} />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            <UserPlus className="w-4 h-4 mr-2" />
                            {loading ? 'Создание...' : 'Добавить клиента'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>База Клиентов ({clients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border h-[500px] overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                <TableRow>
                                    <TableHead>Email (ID)</TableHead>
                                    <TableHead>Telegram Бот</TableHead>
                                    <TableHead>Подписка</TableHead>
                                    <TableHead>Привязка Adobe</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Нет клиентов</TableCell>
                                    </TableRow>
                                )}
                                {clients.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell>
                                            <div className="font-medium text-foreground">{c.email}</div>
                                            <div className="text-xs text-muted-foreground">ID: {c.id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{c.telegram || '-'}</div>
                                            {c.bot_link_token ? (
                                                <div 
                                                    className="text-xs text-blue-500 cursor-pointer flex items-center gap-1 hover:underline mt-1"
                                                    onClick={() => copyBotLink(c.bot_link_token)}
                                                >
                                                    <LinkIcon className="w-3 h-3" /> Пригласить
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground mt-1 block">Нет ссылки</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{c.subscription_ends_at || 'Бессрочно'}</TableCell>
                                        <TableCell>
                                            {c.adobe_account_email ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium text-primary text-sm flex justify-between items-center">
                                                        {c.adobe_account_email}
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleAssignAdobe(null, c.adobe_account_id)}
                                                        >
                                                            Отвязать
                                                        </Button>
                                                    </div>
                                                    <Badge variant={c.adobe_account_status === 'active' ? 'outline' : 'destructive'} className={c.adobe_account_status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 text-[10px]' : 'text-[10px]'}>
                                                        {c.adobe_account_status}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <Select onValueChange={(val) => handleAssignAdobe(c.id, parseInt(val))}>
                                                    <SelectTrigger className="w-full max-w-[200px] h-8 text-xs">
                                                        <SelectValue placeholder="Привязать аккаунт" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableAccounts.length === 0 ? (
                                                            <SelectItem value="none" disabled>Нет свободных аккаунтов</SelectItem>
                                                        ) : (
                                                            availableAccounts.map(acc => (
                                                                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.email}</SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
