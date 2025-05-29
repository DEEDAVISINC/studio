
"use client";
import type { AvailableEquipmentPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Edit3, Globe, MapPin, Mail, Phone, Trash2, Truck as TruckIcon, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface AvailableEquipmentListProps {
  posts: AvailableEquipmentPost[];
  onEdit: (post: AvailableEquipmentPost) => void;
  onDelete: (postId: string) => void;
  getCarrierName: (carrierId: string) => string;
  // In a real app, would also pass current user's carrier ID to control edit/delete
}

export function AvailableEquipmentList({ posts, onEdit, onDelete, getCarrierName }: AvailableEquipmentListProps) {
  const { toast } = useToast();

  const copyContactInfo = (post: AvailableEquipmentPost) => {
    const info = `
Equipment: ${post.equipmentType}
Available From: ${format(new Date(post.availableFromDate), 'PPP')}
Location: ${post.currentLocation}
Contact: ${post.contactName}
Phone: ${post.contactPhone}
${post.contactEmail ? `Email: ${post.contactEmail}\n` : ''}
Carrier: ${getCarrierName(post.carrierId)}
    `.trim();
    navigator.clipboard.writeText(info)
        .then(() => toast({ title: "Contact Info Copied!" }))
        .catch(() => toast({ title: "Failed to copy", variant: "destructive"}));
  };
  
  const getStatusColor = (status: AvailableEquipmentPost['status']) => {
    switch (status) {
      case 'Available': return 'bg-green-500 hover:bg-green-600';
      case 'Booked': return 'bg-blue-500 hover:bg-blue-600';
      case 'Expired': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-slate-400';
    }
  };


  if (posts.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No available equipment posted currently. Be the first to post!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-primary">{post.equipmentType}</CardTitle>
                <Badge className={`${getStatusColor(post.status)} text-white`}>{post.status}</Badge>
            </div>
            <CardDescription>
              Carrier: {getCarrierName(post.carrierId)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm flex-grow">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Currently at: {post.currentLocation}</div>
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> Available: {format(new Date(post.availableFromDate), 'MMM d, yyyy')}
              {post.availableToDate && ` to ${format(new Date(post.availableToDate), 'MMM d, yyyy')}`}
            </div>
            {post.preferredDestinations && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> Pref. Destinations: {post.preferredDestinations}</div>}
            {post.rateExpectation && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> Rate: {post.rateExpectation}</div>}
            
            <div className="pt-2 mt-2 border-t border-border">
                <p className="font-medium text-xs text-muted-foreground mb-1">Contact for this equipment:</p>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {post.contactName} - {post.contactPhone}</div>
                {post.contactEmail && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {post.contactEmail}</div>}
            </div>
            {post.notes && <p className="text-xs italic text-muted-foreground pt-1">Notes: {post.notes}</p>}
          </CardContent>
          <CardFooter className="border-t pt-4 flex gap-2 justify-end">
             {/* Simulating that only the posting carrier can edit/delete */}
             {/* In a real app, you'd check if current user's carrierId matches post.carrierId */}
            <Button variant="outline" size="sm" onClick={() => copyContactInfo(post)}>Copy Contact</Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the equipment posting for "{post.equipmentType}" by {getCarrierName(post.carrierId)}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
