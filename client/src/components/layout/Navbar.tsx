import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon, MenuIcon } from "lucide-react";

interface NavbarProps {
  toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Proyectos", path: "/projects" },
    { name: "Transformaciones", path: "/transformations" },
    { name: "Descripciones", path: "/descriptions" },
  ];
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="font-bold text-xl text-primary">
                  Realtor<span className="text-secondary">360</span>
                </a>
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`${
                      location === item.path
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="mr-4 flex items-center text-sm text-gray-500">
              <span className="bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs font-medium">
                {user?.plan === "free" ? "Free" : "Professional"}
              </span>
              <span className="ml-2 mr-1">28</span>
              <i className="ri-image-2-line text-gray-400"></i>
              <span className="ml-3 mr-1">12</span>
              <i className="ri-file-text-line text-gray-400"></i>
            </div>
            
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
              <BellIcon className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                    <AvatarFallback>{user?.fullName?.charAt(0) || user?.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile">
                    <a className="flex w-full">Perfil y Cuenta</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/subscription">
                    <a className="flex w-full">Suscripción</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/support">
                    <a className="flex w-full">Ayuda y Soporte</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
