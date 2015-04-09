

import java.io.IOException;


import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;






/**
 * Servlet implementation class DataController
 */
@WebServlet("/DataController")
public class DataController extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public DataController() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		
		 request.getRequestDispatcher("/webgraphiceditor/index.html").forward(request, response);
	
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		HttpSession session = request.getSession();
	    
	    
		 String path= request.getParameter("api_url");
		 String patho = request.getParameter("Ofilename");
		 System.out.println(patho);
		 String usero = request.getParameter("user");
		 session.setAttribute("Ofilename", patho);
		 session.setAttribute("user", usero);
		 /*System.out.println(request.getParameter("api_url"));
		 System.out.println(request.getParameter("Ofilename"));*/
		 request.setAttribute("path", path);
		 request.setAttribute("filename", patho);
		 request.getRequestDispatcher("/webgraphiceditor/index.jsp").forward(request, response);
		 
		
		
		 
	}

}
