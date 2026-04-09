import { Link } from 'react-router-dom';
import NinjaLogo from '@/components/NinjaLogo';

export default function ChatWidget() {
  return (
    <Link
      to="/"
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 group border border-primary/20"
      aria-label="Home"
    >
      <NinjaLogo showText={false} className="scale-90" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
    </Link>
  );
}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <NinjaLogo showText={false} className="scale-[0.55] origin-top-left" />
                </div>
                <div className="bg-secondary/60 border border-border/30 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Escalate button */}
          {!escalated && messages.length > 2 && (
            <div className="px-4 pb-1">
              <button
                onClick={handleEscalate}
                className="w-full text-xs text-muted-foreground hover:text-accent py-1.5 flex items-center justify-center gap-1.5 transition-colors font-medium"
              >
                <ArrowRight className="w-3 h-3" />
                Talk to a human
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border/40 bg-background/80">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={escalated ? "Leave a message for our team..." : "Ask me anything..."}
                className="flex-1 bg-secondary/50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-secondary/70 placeholder:text-muted-foreground/60 transition-all"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm shadow-primary/20" disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[9px] text-muted-foreground/50 text-center mt-2 font-medium">Powered by User Ninjas AI</p>
          </div>
        </div>
      )}
    </>
  );
}
