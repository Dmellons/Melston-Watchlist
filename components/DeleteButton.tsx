import * as React from "react"
import { useMediaQuery } from "@/hooks/MediaQuery"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/hooks/User"
import { database } from "@/lib/appwrite"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import SafeIcon from "@/components/SafeIcon"

interface DeleteButtonProps {
  buttonVariant?: "link" | "outline" | "default" | "secondary" | "ghost" | "destructive" | null;
  buttonText?: string | React.JSX.Element;
  title?: string;
  document_id: string;
  onDeleteSuccess?: () => void;
  disabled?: boolean;
}

export default function DeleteButton({
  buttonVariant = "destructive",
  buttonText = "Delete",
  title,
  document_id,
  onDeleteSuccess,
  disabled = false
}: DeleteButtonProps) {
  const { user, setUser } = useUser();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const iconMarkup = buttonText === "Delete" ? <Trash2 className="h-4 w-4" aria-hidden="true" /> : null;
  const buttonContent = (
    <div className="flex gap-1 items-center">
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        iconMarkup
      )}
      {isDeleting ? "Deleting..." : buttonText}
    </div>
  );

  const handleDelete = async () => {
    if (!user || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      await database.deleteDocument(
        'watchlist', 
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!, 
        document_id
      );

      // Update user state by removing the deleted item
      if (user.watchlist?.documents) {
        const updatedDocuments = user.watchlist.documents.filter(
          (item) => item.$id !== document_id
        );

        setUser({
          ...user,
          watchlist: {
            ...user.watchlist,
            documents: updatedDocuments,
            total: user.watchlist.total - 1
          }
        });
      }

      toast.success(`Deleted "${title || 'item'}" from your watchlist!`);
      
      // Call optional success callback
      onDeleteSuccess?.();
      
      // Close the dialog/drawer
      setOpen(false);
      
    } catch (error) {
      console.error('Delete error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete item';
        
      toast.error(`Error deleting "${title || 'item'}": ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const DeleteContent = () => (
    <div className="space-y-6">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-full bg-destructive/10">
            <SafeIcon icon={AlertTriangle} className="h-5 w-5 text-destructive" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Delete Item</h3>
            <p className="text-sm text-destructive/80">This action cannot be undone</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <p className="text-center text-muted-foreground">
          Are you sure you want to delete{" "}
          {title && <span className="font-semibold text-foreground">"{title}"</span>}
          {!title && "this item"} from your watchlist?
        </p>
        
        <p className="text-center text-sm text-muted-foreground">
          You'll need to add it again if you change your mind.
        </p>
      </div>
      
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isDeleting}
          className="flex-1 sm:flex-none"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 sm:flex-none"
        >
          {buttonContent}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={buttonVariant} 
            disabled={disabled || isDeleting}
            size="sm"
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {buttonContent}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="sr-only">
            <DialogTitle>Delete Confirmation</DialogTitle>
            <DialogDescription>
              Confirm deletion of watchlist item
            </DialogDescription>
          </DialogHeader>
          <DeleteContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant={buttonVariant} 
          disabled={disabled || isDeleting}
          size="sm"
          className="transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {buttonContent}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="sr-only">Delete Confirmation</DrawerTitle>
          <DrawerDescription className="sr-only">
            Confirm deletion of watchlist item
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <DeleteContent />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}