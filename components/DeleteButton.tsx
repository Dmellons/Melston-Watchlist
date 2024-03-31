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
import { Trash2 } from "lucide-react"
import { database } from "@/lib/appwrite"
import { toast } from "sonner"
import { useUser } from "@/hooks/User"

export default function DeleteButton({
  buttonVariant = "destructive",
  buttonText = "Delete",
  title,
  document_id
}: {
  buttonVariant?: "link" | "outline" | "default" | "secondary" | "ghost" | "destructive" | null,
  buttonText?: string | React.JSX.Element
  title?: string
  document_id: string
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const iconMarkup = buttonText === "Delete" ? <Trash2 className="h-4 w-4 " aria-hidden="true" /> : null;
  const buttonContent = <div className="flex gap-1">{iconMarkup}{buttonText}</div>;
   function deleteDocument({ id, title }: { id: string, title?: string }) { 
    
    toast.promise(database.deleteDocument('watchlist', 'watchlist', id), {
      loading: 'Deleting...',
      success: (res) => {
        // Trying to do an optomistic update on the user.watchlist array
        // user?.watchlist?.splice(user?.watchlist?.indexOf(id), 1)
        // setUser(user)
        if (title) {
          return `Deleted "${title}" from your watchlist!`
        } else {
          return `Deleted from your watchlist!`
        }
         
      }
      ,
      error: (res) => {
        console.error({ res })
        return `Oops! There was an error deleting "${title}" from your watchlist.\n\nError: ${res.response.message} `
      },
    })
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={buttonVariant}>{buttonContent}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] ">
          <DialogHeader>
            <DialogTitle>Delete</DialogTitle>
            <DialogDescription className="text-lg"> 
              Are you sure you want to delete <br /><strong>{title}</strong>?
            </DialogDescription>
          </DialogHeader>
          <Button
            variant={"destructive"}
            onClick={() => {
              deleteDocument({ id: document_id, title: title })
              setOpen(false)
            }}
          >
            {buttonContent}
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant={buttonVariant}>{buttonContent}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Delete</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to delete <strong>{title}</strong>?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
        <Button
            variant={"destructive"}
            onClick={() => {
              deleteDocument({ id: document_id , title: title})
              setOpen(false)
            }}
          >
            {buttonContent}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

