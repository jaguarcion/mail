"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdobeListTab({ token, clients, onFetchClients }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/adobe", { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                setAccounts(data.data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Точно удалить?')) return;
        try {
            await fetch(`/api/adobe?id=${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            fetchAccounts();
            onFetchClients();
        } catch (e) {
            console.error(e);
        }
    };

    const handleAssign = async (id, status) => {
        let client_id = status === 'busy' ? -1 : null;
        try {
            await fetch(`/api/adobe`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ id, client_id, action: "assign" })
            });
            fetchAccounts();
            onFetchClients();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredAccounts = accounts.filter(acc => 
        acc.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <Card className="flex flex-col h-[calc(100vh-140px)]">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                        <CardTitle>Пул аккаунтов Adobe ({filteredAccounts.length})</CardTitle>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск по email..."
                            className="pl-8 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden flex flex-col p-0 px-6 pb-6">
                    <div className="rounded-md border flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Статус</TableHead>
                                    <TableHead>Привязка</TableHead>
                                    <TableHead className="text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAccounts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Нет аккаунтов</TableCell>
                                    </TableRow>
                                )}
                                {filteredAccounts.map(acc => (
                                    <TableRow key={acc.id}>
                                        <TableCell>
                                            <div className="font-medium">{acc.email}</div>
                                            <a href={`/client/adobe/${acc.access_token}`} target="_blank" className="text-xs text-primary flex items-center gap-1 hover:underline mt-1">
                                                Ссылка <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={acc.status === 'active' ? 'outline' : 'destructive'} className={acc.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}>
                                                {acc.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Select 
                                                value={acc.assigned_client_id ? "busy" : "free"} 
                                                onValueChange={(val) => handleAssign(acc.id, val)}
                                            >
                                                <SelectTrigger className={`w-[130px] h-8 text-xs ${acc.assigned_client_id ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="free">Свободен</SelectItem>
                                                    <SelectItem value="busy">Занят</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(acc.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
