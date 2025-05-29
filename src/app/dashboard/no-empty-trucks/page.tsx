
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardContent here
import { PlusCircle, RadioTower } from "lucide-react";
import { useAppData } from '@/contexts/AppDataContext';
import type { AvailableEquipmentPost } from '@/lib/types';
import { PostAvailableEquipmentDialog } from '@/components/fleetflow/no-empty-trucks/PostAvailableEquipmentDialog';
import { AvailableEquipmentList } from '@/components/fleetflow/no-empty-trucks/AvailableEquipmentList';

export default function NoEmptyTrucksPage() {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AvailableEquipmentPost | null>(null);
  const { availableEquipmentPosts, addAvailableEquipmentPost, updateAvailableEquipmentPost, removeAvailableEquipmentPost, carriers, getCarrierById } = useAppData();

  const handleOpenDialog = (post?: AvailableEquipmentPost) => {
    setEditingPost(post || null);
    setIsPostDialogOpen(true);
  };

  const handleSavePost = (postData: Omit<AvailableEquipmentPost, 'id' | 'postedDate' | 'status'> | AvailableEquipmentPost) => {
    if (editingPost && 'id' in postData) {
      updateAvailableEquipmentPost(postData as AvailableEquipmentPost);
    } else {
      addAvailableEquipmentPost(postData as Omit<AvailableEquipmentPost, 'id' | 'postedDate' | 'status'>);
    }
    setEditingPost(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <RadioTower className="mr-3 h-8 w-8 text-primary" />
            #NoEmptyTrucks - Available Equipment
          </h1>
          <p className="text-muted-foreground">
            Post your available trucks or find equipment for your loads.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Post Equipment
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Current Available Equipment Postings</CardTitle>
          <CardDescription>Browse trucks posted by carriers looking for loads.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailableEquipmentList
            posts={availableEquipmentPosts}
            onEdit={handleOpenDialog}
            onDelete={removeAvailableEquipmentPost}
            getCarrierName={(carrierId) => getCarrierById(carrierId)?.name || 'Unknown Carrier'}
          />
        </CardContent>
      </Card>

      <PostAvailableEquipmentDialog
        isOpen={isPostDialogOpen}
        onOpenChange={(isOpen) => {
          setIsPostDialogOpen(isOpen);
          if (!isOpen) setEditingPost(null);
        }}
        onSave={handleSavePost}
        postToEdit={editingPost}
        carriers={carriers}
      />
    </div>
  );
}
