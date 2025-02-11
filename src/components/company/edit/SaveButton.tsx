import { Button } from "../../../components/ui/button"
import { Loader2, Save } from "lucide-react"

interface SaveButtonProps {
  saving: boolean
  text: string
}

export function SaveButton({ saving, text }: SaveButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={saving}
      className="min-w-[140px] transition-all"
    >
      {saving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Salvando...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {text}
        </>
      )}
    </Button>
  )
}
