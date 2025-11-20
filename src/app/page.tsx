"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Fingerprint, Loader2, MapPin, ShoppingBag, User } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifyLocation } from "@/lib/geolocation";
import { ActivityLog } from "@/components/activity-log";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  id: z.string().min(1, { message: "ID is required." }),
});

export type LogEntry = {
  name: string;
  id: string;
  timestamp: string;
  status: "Success" | "Failed" | "Error";
  details: string;
};

export default function CheckInPage() {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [activityLog, setActivityLog] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      id: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCheckingIn(true);

    const addLogEntry = (status: LogEntry["status"], details: string) => {
      setActivityLog((prev) => [
        {
          ...values,
          status,
          details,
          timestamp: format(new Date(), "PPpp"),
        },
        ...prev,
      ]);
    };

    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Your browser does not support geolocation.",
      });
      addLogEntry("Error", "Browser does not support geolocation.");
      setIsCheckingIn(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const { isInRange, distance } = verifyLocation(latitude, longitude);

        if (isInRange) {
          toast({
            title: "Check-in Successful!",
            description: `Welcome, ${values.name}. You are within the designated area.`,
          });
          addLogEntry("Success", `Checked in ${distance}m from target.`);
        } else {
          toast({
            variant: "destructive",
            title: "Check-in Failed",
            description: `You are too far from the location.`,
          });
          addLogEntry("Failed", `User is ${distance}m away from target.`);
        }
        setIsCheckingIn(false);
        form.reset();
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description: error.message,
        });
        addLogEntry("Error", error.message);
        setIsCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 py-8 sm:p-12">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
            <ShoppingBag className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">
          SPX Check-in Hub
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          MAUÁ LSP64 - Automatic geolocation check-in for team members.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>
            We'll automatically verify your location for check-in.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g. João da Silva" {...field} className="pl-9" />
                      </div>
                      
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel> TSC
                    <FormControl>
                      <div className="relative">
                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g. SPX123456" {...field} className="pl-9" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isCheckingIn}>
                {isCheckingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Check-in
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="w-full max-w-4xl mt-12">
        <h2 className="text-2xl font-headline font-bold text-center">Activity Log</h2>
        <ActivityLog logs={activityLog} />
      </div>

    </main>
  );
}
