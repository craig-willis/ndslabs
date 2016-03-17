// Copyright © 2016
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cmd

import (
	"bufio"
	"fmt"
	"github.com/spf13/cobra"
	"golang.org/x/crypto/ssh/terminal"
	"io/ioutil"
	"os"
	"os/user"
	"strings"
	"syscall"
)

// loginCmd represents the login command
var loginCmd = &cobra.Command{
	Use:    "login",
	Short:  "Login to the server",
	PreRun: Connect,
	Run: func(cmd *cobra.Command, args []string) {
		username, password := credentials()
		usr, err := user.Current()
		if err != nil {
			fmt.Printf("Error looking up current OS user %s\n", err)
			os.Exit(-1)
		}

		token, err := client.Login(username, password)
		if err != nil {
			fmt.Printf("Login error: %s\n", err)
		} else {

			path := usr.HomeDir + "/.apictl"
			os.Mkdir(path, 0700)
			e := ioutil.WriteFile(path+"/.passwd", []byte(username+":"+token), 0644)
			if e != nil {
				fmt.Printf("Error writing passwd data: %s\n", err)
				os.Exit(-1)
			}
			fmt.Printf("Login succeeded\n")
		}
	},
}

func credentials() (string, string) {
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Username: ")
	username, _ := reader.ReadString('\n')

	fmt.Print("Password: ")
	bytePassword, _ := terminal.ReadPassword(int(syscall.Stdin))
	password := string(bytePassword)
	fmt.Print("\n")

	return strings.TrimSpace(username), strings.TrimSpace(password)
}

func init() {
	RootCmd.AddCommand(loginCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// loginCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// loginCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")

}