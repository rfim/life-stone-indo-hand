import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, ArrowLeft, Printer } from 'lucide-react';

export function ComplaintQrPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">QR Code</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* QR Code placeholder */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center">
            <QrCode className="h-24 w-24 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">QR Code for complaint {id}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Complaint ID: <span className="font-mono">{id}</span>
            </p>
            <p className="text-xs text-gray-500">
              Scan this QR code to access complaint details
            </p>
          </div>

          <Button className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Print QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}