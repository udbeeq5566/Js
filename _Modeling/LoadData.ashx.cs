using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mysoft.Map.Modeling;

namespace _Modeling
{
    /// <summary>
    /// LoadData 的摘要说明
    /// </summary>
    public class LoadData : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            string type = context.Request.Form["type"];
            string cid = context.Request.Form["cid"];
            string xmlPath = context.Request.Form["xmlpath"];
            string ojson = context.Request.Form["ojson"];
            string resultJson = string.Empty;

            if (string.IsNullOrEmpty(xmlPath)) throw new ArgumentNullException("xmlPath不能为空");

            AppFormModeling appFormModeling = new AppFormModeling(xmlPath);
            switch (type.ToLower())
            {
                case "appform":
                    resultJson = appFormModeling.GetJson(cid);
                    break;
                case "save":
                    appFormModeling.SaveToFile(ojson);
                    break;
            }

            context.Response.ContentType = "text/plain";
            context.Response.Write(resultJson);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}