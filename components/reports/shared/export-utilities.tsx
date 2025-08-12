'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  FileText, 
  File, 
  Table, 
  Mail, 
  Calendar,
  Settings,
  Clock
} from 'lucide-react';

export default function ExportUtilities() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [exportNote, setExportNote] = useState('');

  const handleQuickExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    console.log(`Exporting as ${format.toUpperCase()}...`);
    // In real implementation, this would trigger the export process
    setTimeout(() => {
      alert(`Report exported as ${format.toUpperCase()} successfully!`);
    }, 1500);
  };

  const handleAdvancedExport = () => {
    console.log('Advanced export with options:', {
      format: selectedFormat,
      includeCharts,
      includeRawData,
      recipientEmails,
      exportNote
    });
    setExportDialogOpen(false);
    setTimeout(() => {
      alert(`Advanced report exported as ${selectedFormat.toUpperCase()} successfully!`);
    }, 1500);
  };

  const handleScheduleReport = () => {
    console.log('Scheduling report...');
    setScheduleDialogOpen(false);
    setTimeout(() => {
      alert('Report scheduled successfully! You will receive email notifications.');
    }, 1000);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => handleQuickExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            Export as PDF
            <Badge variant="secondary" className="ml-auto text-xs">
              Recommended
            </Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleQuickExport('excel')}>
            <File className="w-4 h-4 mr-2" />
            Export as Excel
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
            <Table className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel>Advanced Options</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Custom Export
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setScheduleDialogOpen(true)}>
            <Clock className="w-4 h-4 mr-2" />
            Schedule Reports
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Mail className="w-4 h-4 mr-2" />
            Email Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Advanced Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Export Options</DialogTitle>
            <DialogDescription>
              Configure your export settings for a customized report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Professional Report</SelectItem>
                  <SelectItem value="excel">Excel - Spreadsheet Data</SelectItem>
                  <SelectItem value="csv">CSV - Raw Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label>Include Content</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-charts" 
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(!!checked)}
                />
                <Label htmlFor="include-charts" className="text-sm">
                  Include charts and visualizations
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-raw" 
                  checked={includeRawData}
                  onCheckedChange={(checked) => setIncludeRawData(!!checked)}
                />
                <Label htmlFor="include-raw" className="text-sm">
                  Include raw data tables
                </Label>
              </div>
            </div>
            
            <div>
              <Label>Email Recipients (Optional)</Label>
              <Input 
                placeholder="email1@example.com, email2@example.com"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated email addresses
              </p>
            </div>
            
            <div>
              <Label>Export Note (Optional)</Label>
              <Textarea 
                placeholder="Add a note to include with the report..."
                value={exportNote}
                onChange={(e) => setExportNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setExportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAdvancedExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Reports Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Automatic Reports</DialogTitle>
            <DialogDescription>
              Set up automated report delivery to your email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Report Frequency</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Report Type</Label>
              <Select defaultValue="executive">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="operational">Operational Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Email Recipients</Label>
              <Input placeholder="your.email@company.com" />
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Next Report</span>
              </div>
              <p className="text-sm text-blue-700">
                Your next monthly executive report will be sent on August 1st, 2024.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleScheduleReport}>
              <Clock className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}