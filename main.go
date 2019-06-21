package main

import (
	"log"
	"net/http"
	"os"
)

/**
* Bevor godep save ausgefuert wird:
* export GOPATH="$HOME/go"
* PATH="$GOPATH/bin:$PATH"
**/

// DefaultPort fuer localhost
const DefaultPort = "8000"

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = DefaultPort
		log.Println("Verwende DefaultPort " + DefaultPort)
	}

	return ":" + port
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./public")))
	log.Println("Starte Server...")
	log.Fatal(http.ListenAndServe(getPort(), nil))
}
