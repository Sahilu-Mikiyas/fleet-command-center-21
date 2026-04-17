import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderArchive, Upload, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentEntry {
  id: string;
  name: string;
  uploadedAt: string;
  expiresAt: string;
}

export default function DriverDocumentsPage() {
  const [docs, setDocs] = useState<DocumentEntry[]>([
    { id: '1', name: 'Driver License.pdf', uploadedAt: '2025-01-12', expiresAt: '2027-01-12' },
    { id: '2', name: 'Insurance.pdf', uploadedAt: '2025-04-01', expiresAt: '2026-04-01' },
  ]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocs(prev => [
      { id: String(Date.now()), name: file.name, uploadedAt: new Date().toISOString().slice(0, 10), expiresAt: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10) },
      ...prev,
    ]);
    toast.success(`${file.name} uploaded`);
  };

  const isExpiringSoon = (date: string) => {
    const days = (new Date(date).getTime() - Date.now()) / 86400000;
    return days < 60;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <FolderArchive className="h-6 w-6 text-primary" /> Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">License, insurance, and certifications. Keep them current.</p>
      </motion.div>

      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium">Drag files here or click to upload</p>
          <input id="doc-upload" type="file" className="hidden" onChange={onUpload} />
          <Button asChild className="mt-3" size="sm">
            <label htmlFor="doc-upload">Choose file</label>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Uploaded documents</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No documents uploaded.</p>
          ) : docs.map(d => (
            <div key={d.id} className="flex items-center justify-between rounded-md border border-border p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">Uploaded {d.uploadedAt} • Expires {d.expiresAt}</p>
                </div>
              </div>
              {isExpiringSoon(d.expiresAt) ? (
                <Badge className="bg-amber-500/10 text-amber-600"><AlertTriangle className="h-3 w-3 mr-1" /> Expiring soon</Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-600">Valid</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
