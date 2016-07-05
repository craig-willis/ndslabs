// Copyright © 2016 National Data Service

package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
	"os"
)

func init() {
	deleteServiceCmd.Flags().StringVarP(&catalog, "catalog", "c", "user", "Catalog to use")
	RootCmd.AddCommand(deleteCmd)
	deleteCmd.AddCommand(deleteStackCmd)
	deleteCmd.AddCommand(deleteVolumeCmd)
	deleteCmd.AddCommand(deleteAccountCmd)
	deleteCmd.AddCommand(deleteServiceCmd)
}

var deleteCmd = &cobra.Command{
	Use:   "delete",
	Short: "Delete a resource",
}

var deleteStackCmd = &cobra.Command{
	Use:    "stack [stackName]",
	Short:  "Remove a stack",
	PreRun: Connect,
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			cmd.Usage()
			os.Exit(-1)
		}

		deleteStack(args[0])
	},
}

var deleteVolumeCmd = &cobra.Command{
	Use:    "volume [volumeId]",
	Short:  "Remove a volume",
	PreRun: Connect,
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			cmd.Usage()
			os.Exit(-1)
		}

		deleteVolume(args[0])
	},
}

var deleteAccountCmd = &cobra.Command{
	Use:    "account [accountId]",
	Short:  "Remove a account (admin users only)",
	PreRun: Connect,
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			cmd.Usage()
			os.Exit(-1)
		}

		deleteAccount(args[0])
	},
}

var deleteServiceCmd = &cobra.Command{
	Use:    "service [serviceId]",
	Short:  "Remove a service (admin users only)",
	PreRun: Connect,
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			cmd.Usage()
			os.Exit(-1)
		}

		deleteService(args[0], catalog)
	},
}

func deleteService(service string, catalog string) {
	token := client.Token
	if catalog == "system" {
		password := credentials("Admin password: ")
		t, err := client.Login("admin", password)
		if err != nil {
			fmt.Printf("Unable to delete service %s: %s \n", service, err)
			return
		}
		token = t
	}

	err := client.DeleteService(service, token, catalog)
	if err != nil {
		fmt.Printf("Unable to delete service %s: %s \n", service, err)
	} else {
		fmt.Printf("Service %s deleted\n", service)
	}
}

func deleteAccount(account string) {

	password := credentials("Admin password: ")
	token, err := client.Login("admin", password)
	if err != nil {
		fmt.Printf("Unable to delete account %s: %s \n", account, err)
		return
	}

	err = client.DeleteAccount(account, token)
	if err != nil {
		fmt.Printf("Unable to delete account %s: %s \n", account, err)
	} else {
		fmt.Printf("Account %s deleted\n", account)
	}
}

func deleteVolume(id string) {
	err := client.DeleteVolume(id)
	if err != nil {
		fmt.Printf("Unable to delete volume %s: %s \n", id, err)
	} else {
		fmt.Printf("Volume %s deleted\n", id)
	}
}

func deleteStack(stack string) {
	err := client.DeleteStack(stack)
	if err != nil {
		fmt.Printf("Unable to delete stack %s: %s \n", stack, err)
	} else {
		fmt.Printf("Stack %s deleted\n", stack)
	}
}
