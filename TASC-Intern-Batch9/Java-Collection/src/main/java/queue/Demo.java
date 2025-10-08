package queue;

import java.util.ArrayDeque;
import java.util.Queue;
import java.util.Scanner;

public class Demo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Nhập số lượng khách hàng");
        int n = sc.nextInt();
        Queue<String> queue = new ArrayDeque<>();
        System.out.print("Nhập thông tin các khách hàng: ");
        while(n-- > 0) {
            queue.add(sc.next());
        }

        System.out.println("Thứ tự phục vụ khách hàng");
        while(!queue.isEmpty()) {
            System.out.println("Phục vụ khách hàng: " + queue.poll());
        }
    }
}
