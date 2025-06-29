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
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/hooks/User"
import { database } from "@/lib/appwrite"
import { useState } from "react"

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
    <>
      <div className="text-center mb-4">
        <Trash2 className="h-12 w-12 text-destructive mx-auto mb-2" />
        <p className="text-lg font-semibold">Delete Item</p>
      </div>
      
      <p className="text-center text-muted-foreground mb-6">
        Are you sure you want to delete{" "}
        {title && <strong>"{title}"</strong>}
        {!title && "this item"}? This action cannot be undone.
      </p>
      
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {buttonContent}
        </Button>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={buttonVariant} 
            disabled={disabled || isDeleting}
            size="sm"
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