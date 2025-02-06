import StreamClientProvider from "@/components/providers/StreamClientProvider";

function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>){

    return(
        <StreamClientProvider>
            {children}
        </StreamClientProvider>
    )
}

export default Layout;